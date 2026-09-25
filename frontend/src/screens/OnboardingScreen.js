import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Chip from "../components/Chip";
import { CUISINES, UTENSILS } from "../constants/options";
import { useAppState } from "../state/AppContext";

export default function OnboardingScreen({ navigation }) {
  const { utensilios, paisCocina, saveProfile } = useAppState();
  const [localUtensils, setLocalUtensils] = useState(utensilios);
  const [localCuisine, setLocalCuisine] = useState(paisCocina);

  const toggle = (value) => {
    setLocalUtensils((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const continueToApp = async () => {
    await saveProfile(localUtensils, localCuisine);
    navigation.replace("Ingredientes");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil de cocina</Text>
      <Text style={styles.label}>Utensilios disponibles</Text>
      <View style={styles.wrap}>
        {UTENSILS.map((item) => (
          <Chip key={item} label={item} selected={localUtensils.includes(item)} onPress={() => toggle(item)} />
        ))}
      </View>
      <Text style={styles.label}>Cocina preferida</Text>
      <View style={styles.wrap}>
        {CUISINES.map((item) => (
          <Chip key={item.value} label={item.label} selected={localCuisine === item.value} onPress={() => setLocalCuisine(item.value)} />
        ))}
      </View>
      <TouchableOpacity style={styles.primary} onPress={continueToApp}>
        <Text style={styles.primaryText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f7fff8",
    minHeight: "100%",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#153b2d",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  primary: {
    backgroundColor: "#153b2d",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
