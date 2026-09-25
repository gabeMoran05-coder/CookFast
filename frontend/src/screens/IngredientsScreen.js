import * as ImageManipulator from "expo-image-manipulator";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { analyzeKitchen } from "../api/client";
import Chip from "../components/Chip";
import { COMMON_INGREDIENTS, CUISINES } from "../constants/options";
import { useAppState } from "../state/AppContext";

export default function IngredientsScreen({ navigation }) {
  const { ingredientes, setIngredientes, paisCocina, setPaisCocina, modoEstricto, setModoEstricto } = useAppState();
  const [search, setSearch] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const options = COMMON_INGREDIENTS.filter((item) => item.includes(search.toLowerCase()));

  const toggleIngredient = (value) => {
    setIngredientes(
      ingredientes.includes(value) ? ingredientes.filter((item) => item !== value) : [...ingredientes, value]
    );
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (!cameraRef) return;
    const photo = await cameraRef.takePictureAsync({ base64: true, quality: 0.8 });
    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 800 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setShowCamera(false);
    try {
      const result = await analyzeKitchen(compressed.base64);
      const detected = result.ingredientes_detectados || [];
      setIngredientes(Array.from(new Set([...ingredientes, ...detected.map((item) => item.toLowerCase())])));
      if (result.error) Alert.alert("Vision", result.error);
    } catch (error) {
      Alert.alert("No se pudo analizar", error.message);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraWrap}>
        <CameraView ref={setCameraRef} style={styles.camera} />
        <TouchableOpacity style={styles.capture} onPress={takePhoto}>
          <Text style={styles.primaryText}>Detectar con foto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis ingredientes</Text>
      <TextInput style={styles.input} placeholder="Buscar ingrediente" value={search} onChangeText={setSearch} />
      <View style={styles.wrap}>
        {options.map((item) => (
          <Chip key={item} label={item} selected={ingredientes.includes(item)} onPress={() => toggleIngredient(item)} />
        ))}
      </View>
      <Text style={styles.label}>Pais / cocina</Text>
      <View style={styles.wrap}>
        {CUISINES.map((item) => (
          <Chip key={item.value} label={item.label} selected={paisCocina === item.value} onPress={() => setPaisCocina(item.value)} />
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Modo estricto</Text>
        <Switch value={modoEstricto} onValueChange={setModoEstricto} />
      </View>
      <TouchableOpacity style={styles.secondary} onPress={openCamera}>
        <Text style={styles.secondaryText}>+ Camara detectar con foto</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate("Resultados")}>
        <Text style={styles.primaryText}>Buscar recetas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7fff8", minHeight: "100%" },
  title: { fontSize: 30, fontWeight: "800", color: "#153b2d", marginBottom: 18 },
  input: { borderWidth: 1, borderColor: "#8aa39b", borderRadius: 8, padding: 12, backgroundColor: "#fff" },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  label: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 14 },
  primary: { backgroundColor: "#153b2d", borderRadius: 8, padding: 16, alignItems: "center", marginTop: 12 },
  secondary: { borderColor: "#153b2d", borderWidth: 1, borderRadius: 8, padding: 16, alignItems: "center", marginTop: 16 },
  primaryText: { color: "#fff", fontWeight: "800" },
  secondaryText: { color: "#153b2d", fontWeight: "800" },
  cameraWrap: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  capture: { backgroundColor: "#1f7a5c", margin: 20, padding: 16, borderRadius: 8, alignItems: "center" },
});
