import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { woodTheme } from "../theme/wood";

export default function WoodBackground({ children }: PropsWithChildren) {
  const c = woodTheme.colors;
  return (
    <View className="flex-1" style={{ backgroundColor: c.woodBgEnd }}>
      {/* Deep vertical gradient */}
      <LinearGradient
        colors={[c.woodBgStart, c.woodBgEnd]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* Stronger vignette for edge darkening */}
      <LinearGradient
        colors={["rgba(0,0,0,0.35)", "transparent", "rgba(0,0,0,0.45)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* Warm diagonal tint for depth */}
      <LinearGradient
        colors={["transparent", "rgba(62,27,14,0.14)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* Polished sheen band near top third */}
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.06)", "transparent"]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 0.3 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
      />
      {children}
    </View>
  );
}
