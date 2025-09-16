import React, { useEffect, useRef } from "react";
import { View, Text, Platform, Animated, Easing } from "react-native";
import WoodBackground from "./WoodBackground";
import AppLogo from "./AppLogo";

interface StartupSplashProps {
  visible: boolean;
  onDone?: () => void;
  durationMs?: number; // how long to stay before fade out
}

export default function StartupSplash({ visible, onDone, durationMs = 1600 }: StartupSplashProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    let cancelled = false;
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        const t = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished && !cancelled && onDone) onDone();
          });
        }, durationMs);
        // cleanup timeout if unmounts early
        return () => clearTimeout(t);
      });
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      cancelled = true;
    };
  }, [visible, durationMs, onDone, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, opacity }}
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
