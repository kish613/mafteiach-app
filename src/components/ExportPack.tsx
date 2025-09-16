import React, { forwardRef } from "react";
import { View, Text } from "react-native";
import { TorahSource } from "../state/searchStore";
import HebrewText from "./HebrewText";

interface Props {
  query: string;
  sources: TorahSource[];
}

const ExportPack = forwardRef<View, Props>(({ query, sources }, ref) => {
  return (
    <View ref={ref as any} className="p-4" style={{ backgroundColor: "#1C120C" }}>
      <Text className="text-lg mb-3" style={{ color: "#E7D1A8" }}>Mafteiach — Chabura Pack</Text>
      <Text className="text-sm mb-4" style={{ color: "#C7B08B" }}>Topic: {query}</Text>
      {sources.map((s) => (
        <View key={s.id} className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}>
          <HebrewText className="text-yellow-600 text-sm mb-1" isHebrew>{s.location}</HebrewText>
          <HebrewText className="text-white text-lg font-semibold mb-1" isHebrew>{s.title}</HebrewText>
          <HebrewText className="text-neutral-300" isHebrew>{s.text}</HebrewText>
        </View>
      ))}
    </View>
  );
});

export default ExportPack;
