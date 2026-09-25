import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function Tag({ label, tone = "default", onPress }) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress} style={[styles.tag, tone === "warn" && styles.tagWarn]}>
      <Text style={[styles.tagText, tone === "warn" && styles.tagWarnText]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function RecipeDetailScreen({ route, navigation }) {
  const recipe = route.params?.recipe || {};
  const used = recipe.ingredientes_usados || [];
  const missing = recipe.ingredientes_faltantes || [];
  const equipment = recipe.equipo_requerido || [];
  const instructions = recipe.instrucciones || recipe.instructions || "La API no envio instrucciones completas para esta receta.";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {recipe.imagen ? <Image source={{ uri: recipe.imagen }} style={styles.image} /> : <View style={styles.imageEmpty} />}
      <View style={styles.body}>
        <Text style={styles.source}>{recipe.fuente || "API recetas"}</Text>
        <Text style={styles.title}>{recipe.titulo || "Receta"}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Math.round(recipe.calificacion || 0)}</Text>
            <Text style={styles.statLabel}>pts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{recipe.likes || 0}</Text>
            <Text style={styles.statLabel}>likes</Text>
          </View>
          <View style={styles.statWide}>
            <Text style={styles.statValue}>{missing.length}</Text>
            <Text style={styles.statLabel}>faltantes</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Usa</Text>
        <View style={styles.wrap}>{used.length ? used.map((item) => <Tag key={item} label={item} />) : <Tag label="ver instrucciones" />}</View>

        {missing.length ? (
          <>
            <Text style={styles.sectionTitle}>Te falta</Text>
            <View style={styles.wrap}>
              {missing.map((item) => (
                <Tag key={item} label={item} tone="warn" onPress={() => navigation.navigate("DondeComprar", { ingrediente: item })} />
              ))}
            </View>
          </>
        ) : null}

        {equipment.length || recipe.utensilio_faltante ? (
          <>
            <Text style={styles.sectionTitle}>Utensilios</Text>
            <View style={styles.wrap}>
              {equipment.map((item) => <Tag key={item} label={item} />)}
              {recipe.utensilio_faltante ? <Tag label={recipe.utensilio_faltante} tone="warn" /> : null}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Preparacion</Text>
        <Text style={styles.instructions}>{instructions}</Text>

        {recipe.url ? (
          <TouchableOpacity style={styles.primary} onPress={() => Linking.openURL(recipe.url)}>
            <Text style={styles.primaryText}>Abrir fuente original</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4fbf6" },
  container: { paddingBottom: 34 },
  image: { width: "100%", height: 260, backgroundColor: "#d9e7df" },
  imageEmpty: { width: "100%", height: 180, backgroundColor: "#d9e7df" },
  body: { padding: 20 },
  source: { color: "#2f7d5d", fontWeight: "900", textTransform: "uppercase", marginBottom: 8 },
  title: { color: "#14392b", fontSize: 32, lineHeight: 36, fontWeight: "900" },
  statsRow: { flexDirection: "row", gap: 10, marginVertical: 18 },
  stat: { flex: 1, backgroundColor: "#ffffff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#d4e1db" },
  statWide: { flex: 1.2, backgroundColor: "#ffffff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#d4e1db" },
  statValue: { color: "#14392b", fontSize: 22, fontWeight: "900" },
  statLabel: { color: "#526b61", fontWeight: "800", marginTop: 2 },
  sectionTitle: { color: "#14392b", fontSize: 19, fontWeight: "900", marginTop: 10, marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 8 },
  tag: { backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#c7d7cf", paddingHorizontal: 12, paddingVertical: 9, margin: 4 },
  tagWarn: { backgroundColor: "#fff3d4", borderColor: "#f2cf83" },
  tagText: { color: "#14392b", fontWeight: "800" },
  tagWarnText: { color: "#744800", fontWeight: "900" },
  instructions: { color: "#2d4039", fontSize: 16, lineHeight: 24, backgroundColor: "#ffffff", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#d4e1db" },
  primary: { marginTop: 18, minHeight: 58, borderRadius: 18, backgroundColor: "#14392b", alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
});
