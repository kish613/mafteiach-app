import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../utils/cn";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface SearchButtonProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function SearchButton({
  onPress,
  title = "Search",
  disabled = false,
  loading = false,
  className,
}: SearchButtonProps) {
  const handlePress = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={cn(
        "rounded-2xl overflow-hidden",
        (disabled || loading) && "opacity-50",
        className
      )}
      style={{ transform: [{ scale: disabled || loading ? 1 : 1 }] }}
    >
      <LinearGradient
        colors={["#7A3F19", "#4B240F"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingVertical: 14, paddingHorizontal: 24, alignItems: "center" }}
      >
        <Text className="text-lg font-semibold" style={{ color: "#E7D1A8", textShadowColor: "#1A0A05", textShadowRadius: 6, textShadowOffset: { width: 0, height: 2 } }}>
          {loading ? "Searching..." : title}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}