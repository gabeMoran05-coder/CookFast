import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getRecipes } from "../api/client";
import { useAppState } from "../state/AppContext";

export default function ResultsScreen({ navigation }) {
  const { ingredientes, utensilios, paisCocina, modoEstricto } = useAppState();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecipes({ ingredientes, utensilios, paisCocina, modoEstricto })
      .then((data) => setRecipes(data.recetas || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recetas para ti</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {recipes.map((recipe) => (
        <View key={recipe.id} style={styles.card}>
          {recipe.imagen ? <Image source={{ uri: recipe.imagen }} style={styles.image} /> : null}
          <Text style={styles.name}>{recipe.titulo}</Text>
          <Text style={styles.meta}>Calificacion: {Math.round(recipe.calificacion || 0)} | Likes: {recipe.likes || 0}</Text>
          <Text style={styles.meta}>Usa: {(recipe.ingredientes_usados || []).join(", ") || "ver instrucciones"}</Text>
          {(recipe.equipo_requerido || []).length ? <Text style={styles.warn}>Equipo requerido: {recipe.equipo_requerido.join(", ")}</Text> : null}
          {recipe.utensilio_faltante ? <Text style={styles.warn}>{recipe.utensilio_faltante}</Text> : null}
          {(recipe.ingredientes_faltantes || []).map((item) => (
            <TouchableOpacity key={item} style={styles.missing} onPress={() => navigation.navigate("DondeComprar", { ingrediente: item })}>
              <Text style={styles.missingText}>Te falta: {item} - Donde lo consigo?</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7fff8", minHeight: "100%" },
  center: { flex: 1 },
  title: { fontSize: 30, fontWeight: "800", color: "#153b2d", marginBottom: 18 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#d5e3df" },
  image: { width: "100%", height: 170, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "800", color: "#153b2d" },
  meta: { color: "#455c55", marginTop: 6 },
  warn: { color: "#986800", marginTop: 8, fontWeight: "700" },
  missing: { backgroundColor: "#fff4d6", borderRadius: 8, padding: 10, marginTop: 8 },
  missingText: { color: "#604100", fontWeight: "700" },
  error: { color: "#a12020", marginBottom: 12 },
});
