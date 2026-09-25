import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: "#8aa39b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    backgroundColor: "#ffffff",
  },
  selected: {
    backgroundColor: "#1f7a5c",
    borderColor: "#1f7a5c",
  },
  text: {
    color: "#1f2d2a",
  },
  selectedText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
