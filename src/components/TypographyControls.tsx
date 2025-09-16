import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../state/appStore";

export default function TypographyControls() {
  const textScale = useAppStore(s => s.textScale);
  const lineHeight = useAppStore(s => s.lineHeight);
  const justify = useAppStore(s => s.justifyText);
  const setTextScale = useAppStore(s => s.setTextScale);
  const setLineHeight = useAppStore(s => s.setLineHeight);
  const setJustify = useAppStore(s => s.setJustifyText);

  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <Pressable onPress={() => setTextScale(textScale - 0.1)} className="px-2 py-1 rounded-lg" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
        <Text style={{ color: "#E7D1A8" }}>A-</Text>
      </Pressable>
      <Pressable onPress={() => setTextScale(textScale + 0.1)} className="px-2 py-1 rounded-lg" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
        <Text style={{ color: "#E7D1A8" }}>A+</Text>
      </Pressable>
      <Pressable onPress={() => setLineHeight(lineHeight + 0.05)} className="px-2 py-1 rounded-lg" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
        <Ionicons name="reorder-three-outline" size={18} color="#E7D1A8" />
      </Pressable>
      <Pressable onPress={() => setJustify(!justify)} className="px-2 py-1 rounded-lg" style={{ backgroundColor: justify ? "#7A3F19" : "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
        <Ionicons name="menu-outline" size={18} color="#E7D1A8" />
      </Pressable>
    </View>
  );
}
