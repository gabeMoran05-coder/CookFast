import * as ImageManipulator from "expo-image-manipulator";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { analyzeKitchen } from "../api/client";
import { COMMON_INGREDIENTS, CUISINES } from "../constants/options";
import { useAppState } from "../state/AppContext";

function Pill({ label, selected, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={[styles.pill, selected && styles.pillSelected]}>
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToggleBubble({ value, onValueChange }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      style={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
    </TouchableOpacity>
  );
}

export default function IngredientsScreen({ navigation }) {
  const {
    ingredientes,
    setIngredientes,
    utensilios,
    paisCocina,
    setPaisCocina,
    modoEstricto,
    setModoEstricto,
    saveProfile,
  } = useAppState();
  const [search, setSearch] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastDetection, setLastDetection] = useState("");

  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return COMMON_INGREDIENTS;
    return COMMON_INGREDIENTS.filter((item) => item.toLowerCase().includes(term));
  }, [search]);

  const selectedCuisine = CUISINES.find((item) => item.value === paisCocina)?.label || "Sin preferencia";

  const toggleIngredient = (value) => {
    setIngredientes(
      ingredientes.includes(value) ? ingredientes.filter((item) => item !== value) : [...ingredientes, value]
    );
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Camara", "Necesito permiso de camara para detectar alimentos.");
        return;
      }
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (!cameraRef || analyzing) return;
    setAnalyzing(true);
    try {
      const photo = await cameraRef.takePictureAsync({ base64: true, quality: 0.82 });
      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 900 } }],
        { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const result = await analyzeKitchen(compressed.base64);
      const detected = (result.ingredientes_detectados || []).map((item) => String(item).toLowerCase());
      const detectedTools = (result.utensilios_detectados || []).map((item) => String(item).toLowerCase());
      const nextIngredients = Array.from(new Set([...ingredientes, ...detected]));
      setIngredientes(nextIngredients);
      if (detectedTools.length) {
        await saveProfile(Array.from(new Set([...utensilios, ...detectedTools])), paisCocina);
      }
      setLastDetection(detected.length ? detected.join(", ") : "No detecte ingredientes claros");
      setShowCamera(false);
      Alert.alert("IA de cocina", detected.length ? `Detecte: ${detected.join(", ")}` : "No detecte ingredientes claros.");
    } catch (error) {
      Alert.alert("No se pudo analizar", error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraWrap}>
        <CameraView ref={setCameraRef} style={styles.camera} />
        <View style={styles.cameraTop}>
          <TouchableOpacity style={styles.cameraGhost} onPress={() => setShowCamera(false)}>
            <Text style={styles.cameraGhostText}>Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Apunta al alimento</Text>
        </View>
        <View style={styles.cameraBottom}>
          <TouchableOpacity style={styles.capture} onPress={takePhoto} disabled={analyzing}>
            {analyzing ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.captureText}>Detectar con IA</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>CookFast mobile</Text>
        <Text style={styles.title}>Mis ingredientes</Text>
        <Text style={styles.subtitle}>Elige lo que tienes, toma foto si quieres, y la API arma recetas reales.</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{ingredientes.length}</Text>
            <Text style={styles.metricLabel}>ingredientes</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{utensilios.length}</Text>
            <Text style={styles.metricLabel}>utensilios</Text>
          </View>
          <View style={styles.metricCardWide}>
            <Text style={styles.metricValueSmall}>{selectedCuisine}</Text>
            <Text style={styles.metricLabel}>cocina</Text>
          </View>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Buscar ingrediente o bebida"
        placeholderTextColor="#73817b"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredientes y bebidas</Text>
        <Text style={styles.sectionHint}>{modoEstricto ? "solo seleccionados" : "puede sugerir extras"}</Text>
      </View>
      <View style={styles.wrap}>
        {options.map((item) => (
          <Pill key={item} label={item} selected={ingredientes.includes(item)} onPress={() => toggleIngredient(item)} />
        ))}
      </View>

      {lastDetection ? (
        <View style={styles.detectedCard}>
          <Text style={styles.detectedLabel}>Ultima deteccion IA</Text>
          <Text style={styles.detectedText}>{lastDetection}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Pais / cocina</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineRow}>
        {CUISINES.map((item) => (
          <Pill
            key={item.value || "all"}
            label={item.label}
            selected={paisCocina === item.value}
            onPress={() => setPaisCocina(item.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.strictCard}>
        <View style={styles.strictCopy}>
          <Text style={styles.strictTitle}>Solo mis ingredientes</Text>
          <Text style={styles.strictText}>
            Activalo para pedir recetas que usen exclusivamente lo que marcaste.
          </Text>
        </View>
        <ToggleBubble value={modoEstricto} onValueChange={setModoEstricto} />
      </View>

      <TouchableOpacity style={styles.secondary} onPress={openCamera} activeOpacity={0.86}>
        <Text style={styles.secondaryText}>Camara IA para detectar comida</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate("Resultados")} activeOpacity={0.9}>
        <Text style={styles.primaryText}>Buscar recetas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4fbf6" },
  container: { padding: 20, paddingBottom: 34 },
  hero: {
    backgroundColor: "#14392b",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#0b2018",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  eyebrow: { color: "#a9d8c1", fontWeight: "900", letterSpacing: 0, textTransform: "uppercase", marginBottom: 8 },
  title: { color: "#ffffff", fontSize: 34, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#d8ede2", marginTop: 10, fontSize: 15, lineHeight: 21 },
  metricsRow: { flexDirection: "row", gap: 8, marginTop: 18 },
  metricCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 18, padding: 12 },
  metricCardWide: { flex: 1.45, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 18, padding: 12 },
  metricValue: { color: "#ffffff", fontSize: 24, fontWeight: "900" },
  metricValueSmall: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  metricLabel: { color: "#bddccc", fontSize: 12, marginTop: 2 },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c7d7cf",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#14392b",
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: "#14392b", marginBottom: 10 },
  sectionHint: { color: "#597067", fontWeight: "800", fontSize: 12, marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 16 },
  cuisineRow: { paddingBottom: 14 },
  pill: {
    borderWidth: 1,
    borderColor: "#b9cac2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4,
    backgroundColor: "#ffffff",
  },
  pillSelected: { backgroundColor: "#2f7d5d", borderColor: "#2f7d5d" },
  pillText: { color: "#22342e", fontSize: 15, fontWeight: "700" },
  pillTextSelected: { color: "#ffffff", fontWeight: "900" },
  detectedCard: {
    backgroundColor: "#e9f7ef",
    borderWidth: 1,
    borderColor: "#bfe1cf",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  detectedLabel: { color: "#2f7d5d", fontWeight: "900", marginBottom: 4 },
  detectedText: { color: "#173c2d", fontWeight: "700" },
  strictCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d2dfd8",
    marginTop: 4,
    marginBottom: 16,
  },
  strictCopy: { flex: 1, paddingRight: 14 },
  strictTitle: { color: "#14392b", fontSize: 18, fontWeight: "900" },
  strictText: { color: "#526b61", marginTop: 4, lineHeight: 19 },
  toggle: {
    width: 58,
    height: 34,
    borderRadius: 18,
    padding: 4,
    backgroundColor: "#d1ddd7",
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: "#2f7d5d" },
  toggleDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#ffffff" },
  toggleDotOn: { transform: [{ translateX: 24 }] },
  secondary: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#14392b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#f8fffb",
  },
  secondaryText: { color: "#14392b", fontWeight: "900", fontSize: 16 },
  primary: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "#14392b",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#ffffff", fontSize: 17, fontWeight: "900" },
  cameraWrap: { flex: 1, backgroundColor: "#07120e" },
  camera: { flex: 1 },
  cameraTop: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraGhost: { backgroundColor: "rgba(0,0,0,0.48)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  cameraGhostText: { color: "#ffffff", fontWeight: "900" },
  cameraTitle: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  cameraBottom: { position: "absolute", left: 22, right: 22, bottom: 34, alignItems: "center" },
  capture: {
    width: "100%",
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: "#2f7d5d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
  },
  captureText: { color: "#ffffff", fontWeight: "900", fontSize: 17 },
});
