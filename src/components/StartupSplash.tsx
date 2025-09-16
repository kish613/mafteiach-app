import React, { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import WoodBackground from "./WoodBackground";
import AppLogo from "./AppLogo";

interface StartupSplashProps {
  visible: boolean;
  onDone?: () => void;
  durationMs?: number; // how long to stay before fade out
}

export default function StartupSplash({ visible, onDone, durationMs = 1600 }: StartupSplashProps) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      const t = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 320 }, (finished) => {
          if (finished && onDone) runOnJS(onDone)();
        });
      }, durationMs);
      return () => clearTimeout(t);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }, animatedStyle]}
    >
      <WoodBackground>
        <View className="flex-1 items-center justify-center px-6">
          <AppLogo className="mb-8" />
          <Text
            accessibilityLabel="Developed by A Teitelbaum"
            style={{
              marginTop: 4,
              fontSize: 20,
              fontWeight: "600",
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              color: "#E7D1A8",
              letterSpacing: 0.2,
              textAlign: "center",
            }}
          >
            Developed by A Teitelbaum
          </Text>
        </View>
      </WoodBackground>
    </Animated.View>
  );
}
