import React, { PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../utils/cn";
import { woodTheme } from "../theme/wood";

interface WoodCardProps extends PropsWithChildren {
  className?: string;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  radius?: number;
}

export default function WoodCard({ className, style, children, padded = true, radius = 16 }: WoodCardProps) {
  const c = woodTheme.colors;
  return (
    <View style={[{ borderRadius: radius }, style]} className={cn("relative", className)}>
      {/* Base */}
      <LinearGradient
        colors={[c.cardDark, c.cardDarker]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius }}
      />
      {/* Bevel highlight */}
      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{ position: "absolute", top: 1, left: 1, right: 1, bottom: 1, borderRadius: radius - 1 }}
      />
      {/* Border */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: c.brassDark + "80",
        }}
      />
      <View className={cn(padded ? "p-4" : undefined)}>{children}</View>
    </View>
  );
}
