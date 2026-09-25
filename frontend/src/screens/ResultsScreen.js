import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getRecipes } from "../api/client";
import { useAppState } from "../state/AppContext";

function RecipeCard({ recipe, onPress, onMissing }) {
  const missing = recipe.ingredientes_faltantes || [];
  const used = recipe.ingredientes_usados || [];

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      {recipe.imagen ? <Image source={{ uri: recipe.imagen }} style={styles.image} /> : <View style={styles.imageEmpty} />}
      <View style={styles.cardBody}>
        <View style={styles.cardTopline}>
          <Text style={styles.source}>{recipe.fuente || "API recetas"}</Text>
          <Text style={styles.score}>{Math.round(recipe.calificacion || 0)} pts</Text>
        </View>
        <Text style={styles.name}>{recipe.titulo}</Text>
        <Text style={styles.meta} numberOfLines={2}>Usa: {used.join(", ") || "ver receta completa"}</Text>
        {missing.length ? <Text style={styles.warn} numberOfLines={2}>Te falta: {missing.join(", ")}</Text> : null}
        {(recipe.equipo_requerido || []).length ? (
          <Text style={styles.warn} numberOfLines={1}>Equipo: {recipe.equipo_requerido.join(", ")}</Text>
        ) : null}
        {recipe.utensilio_faltante ? <Text style={styles.warn}>{recipe.utensilio_faltante}</Text> : null}
        <View style={styles.cardFooter}>
          <Text style={styles.likes}>{recipe.likes || 0} likes</Text>
          <Text style={styles.openText}>Abrir receta</Text>
        </View>
        {missing.slice(0, 3).map((item) => (
          <TouchableOpacity key={item} style={styles.missing} onPress={() => onMissing(item)}>
            <Text style={styles.missingText}>Comprar {item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function ResultsScreen({ navigation }) {
  const { ingredientes, utensilios, paisCocina, modoEstricto } = useAppState();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  const loadRecipes = useCallback(() => {
    setLoading(true);
    setError("");
    getRecipes({ ingredientes, utensilios, paisCocina, modoEstricto })
      .then((data) => setRecipes(data.recetas || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ingredientes, utensilios, paisCocina, modoEstricto]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{modoEstricto ? "modo exacto" : "modo flexible"}</Text>
        <Text style={styles.title}>Recetas para ti</Text>
        <Text style={styles.subtitle}>
          {ingredientes.length ? ingredientes.slice(0, 5).join(", ") : "Sin ingredientes"}
          {ingredientes.length > 5 ? ` +${ingredientes.length - 5}` : ""}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#2f7d5d" size="large" />
          <Text style={styles.loadingText}>Buscando recetas con la API...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>No pude conectar con la API</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={loadRecipes}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !error && recipes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No salieron recetas</Text>
          <Text style={styles.emptyText}>Prueba quitar el modo exacto o agregar mas ingredientes.</Text>
        </View>
      ) : null}

      {recipes.map((recipe, index) => (
        <RecipeCard
          key={`${recipe.id || recipe.titulo}-${index}`}
          recipe={recipe}
          onPress={() => navigation.navigate("DetalleReceta", { recipe })}
          onMissing={(ingrediente) => navigation.navigate("DondeComprar", { ingrediente })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4fbf6" },
  container: { padding: 18, paddingBottom: 32 },
  hero: { backgroundColor: "#14392b", borderRadius: 26, padding: 20, marginBottom: 16 },
  eyebrow: { color: "#a9d8c1", fontWeight: "900", textTransform: "uppercase", marginBottom: 6 },
  title: { color: "#ffffff", fontSize: 32, lineHeight: 36, fontWeight: "900" },
  subtitle: { color: "#d8ede2", marginTop: 8, fontSize: 15 },
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d2dfd8",
    marginBottom: 14,
  },
  loadingText: { color: "#526b61", marginTop: 12, fontWeight: "800" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d4e1db",
    shadowColor: "#0b2018",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  image: { width: "100%", height: 178, backgroundColor: "#d9e7df" },
  imageEmpty: { width: "100%", height: 126, backgroundColor: "#d9e7df" },
  cardBody: { padding: 16 },
  cardTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  source: { color: "#2f7d5d", fontWeight: "900", textTransform: "uppercase", fontSize: 12 },
  score: { color: "#14392b", fontWeight: "900" },
  name: { fontSize: 22, fontWeight: "900", color: "#142923", marginBottom: 8 },
  meta: { color: "#526b61", lineHeight: 20, fontSize: 15 },
  warn: { color: "#915900", marginTop: 8, fontWeight: "900", lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  likes: { color: "#1f765f", fontWeight: "900" },
  openText: { color: "#14392b", fontWeight: "900" },
  missing: { backgroundColor: "#fff3d4", borderRadius: 14, padding: 10, marginTop: 10 },
  missingText: { color: "#6b4300", fontWeight: "900" },
  errorCard: { backgroundColor: "#fff2f2", borderRadius: 22, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#f0c6c6" },
  errorTitle: { color: "#8b2020", fontWeight: "900", fontSize: 18 },
  errorText: { color: "#8b2020", marginTop: 6 },
  retry: { backgroundColor: "#8b2020", borderRadius: 14, padding: 12, marginTop: 12, alignItems: "center" },
  retryText: { color: "#ffffff", fontWeight: "900" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#d2dfd8" },
  emptyTitle: { color: "#14392b", fontWeight: "900", fontSize: 20 },
  emptyText: { color: "#526b61", marginTop: 8 },
});
