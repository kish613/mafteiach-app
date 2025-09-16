import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "../utils/cn";


interface SourceCounterProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function SourceCounter({
  value,
  onValueChange,
  min = 5,
  max = 50,
  step = 5,
  className,
}: SourceCounterProps) {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      Haptics.selectionAsync();
      onValueChange(newValue);
    }
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      Haptics.selectionAsync();
      onValueChange(newValue);
    }
  };

  return (
    <View className={cn("items-center", className)}>
      <Text className="text-[22px] font-semibold mb-4" style={{ color: "#E7D1A8", textShadowColor: "#1A0A05", textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } }}>Number of Sources</Text>
      
      <View className="flex-row items-center justify-center mb-2">
        <Pressable
          onPress={handleDecrease}
          className="w-12 h-12 rounded-full items-center justify-center mr-6"
          style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
          disabled={value <= min}
        >
          <Ionicons name="chevron-back" size={24} color="#D2A35C" />
        </Pressable>
        
        <View className="items-center">
          <Text className="text-5xl font-extrabold" style={{ color: "#E7D1A8", textShadowColor: "#1A0A05", textShadowRadius: 6, textShadowOffset: { width: 0, height: 2 } }}>{value}</Text>
          <Text className="text-sm" style={{ color: "#C7B08B" }}>sources</Text>
        </View>
        
        <Pressable
          onPress={handleIncrease}
          className="w-12 h-12 rounded-full items-center justify-center ml-6"
          style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
          disabled={value >= max}
        >
          <Ionicons name="chevron-forward" size={24} color="#D2A35C" />
        </Pressable>
      </View>
      
      <Text className="text-xs text-center" style={{ color: "#B89367" }}>
        tap arrows to adjust ({min}-{max}, increments of {step})
      </Text>
    </View>
  );
}