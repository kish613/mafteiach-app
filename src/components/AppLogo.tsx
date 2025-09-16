import React from "react";
import { View, Text, Image } from "react-native";
import { cn } from "../utils/cn";

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {

  return (
    <View className={cn("items-center", className)}>
      {/* Brand Logo */}
      <Image
        source={require("../../assets/logo/mafteiach-logo-wood-v2.jpg")}
        style={{ width: 200, height: 200, resizeMode: "contain" }}
        accessibilityLabel="Mafteiach logo"
      />

      {/* App Title */}
      <Text className="text-3xl font-bold mb-1" style={{ color: "#E7D1A8", textShadowColor: "#1A0A05", textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } }}>Mafteiach</Text>
      <Text className="text-sm tracking-wider uppercase" style={{ color: "#C7B08B" }}>
        TORAH SOURCE NAVIGATOR
      </Text>
    </View>
  );
}