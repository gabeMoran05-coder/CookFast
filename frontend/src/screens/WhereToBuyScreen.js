import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { deliveryCost, whereToBuy } from "../api/client";

export default function WhereToBuyScreen({ route }) {
  const ingrediente = route.params?.ingrediente || "tomate";
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [delivery, setDelivery] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setMessage("Permiso de ubicacion denegado.");
        setDelivery(await deliveryCost({ ingrediente }));
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const [storesData, deliveryData] = await Promise.all([
        whereToBuy({ ingrediente, latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
        deliveryCost({ ingrediente }),
      ]);
      setStores(storesData.tiendas || []);
      setMessage(storesData.mensaje || "");
      setDelivery(deliveryData);
      setLoading(false);
    }
    load().catch((err) => {
      setMessage(err.message);
      setLoading(false);
    });
  }, [ingrediente]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Donde consigo {ingrediente}</Text>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      <Text style={styles.section}>Tiendas cerca de ti</Text>
      {stores.map((store) => (
        <View key={`${store.nombre}-${store.direccion}`} style={styles.card}>
          <Text style={styles.name}>{store.nombre}</Text>
          <Text>{store.direccion}</Text>
          <Text>{store.distancia_km} km</Text>
          <Text>Precio: {store.precio ? `$${store.precio}` : "no disponible"}</Text>
        </View>
      ))}
      <Text style={styles.section}>Estimado por delivery</Text>
      {delivery ? (
        <View style={styles.card}>
          <Text style={styles.name}>Estimado simulado</Text>
          <Text>Total: {delivery.total_estimado ? `$${delivery.total_estimado}` : "sin precio base"}</Text>
          <Text>{delivery.nota}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f7fff8", minHeight: "100%" },
  center: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", color: "#153b2d", marginBottom: 18 },
  section: { fontSize: 18, fontWeight: "800", marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#d5e3df" },
  name: { fontWeight: "800", fontSize: 16, color: "#153b2d", marginBottom: 4 },
  notice: { backgroundColor: "#fff4d6", padding: 12, borderRadius: 8, color: "#604100" },
});
