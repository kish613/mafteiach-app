import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, Platform } from "react-native";
import TabNavigator from "./src/navigation/TabNavigator";
import { woodTheme } from "./src/theme/wood";
import ErrorBoundary from "./src/components/ErrorBoundary";
import StartupSplash from "./src/components/StartupSplash";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  // Set a tasteful default serif font (iOS-optimized)
  // English -> Georgia; Hebrew -> overridden in HebrewText
  // This avoids flashing by setting RN default Text style
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Text as any).defaultProps.style = [{ fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" }];

  const [showSplash, setShowSplash] = useState(true);

  const navTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: "#C7954B",
      background: woodTheme.colors.woodBgEnd,
      card: woodTheme.colors.woodBgEnd,
      text: "#E5CDA4",
      border: "#1E0B05",
      notification: "#C7954B",
    },
  } as const;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <View className="flex-1" style={{ backgroundColor: woodTheme.colors.woodBgEnd }}>
          <ErrorBoundary>
            <NavigationContainer theme={navTheme as any}>
              <TabNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </ErrorBoundary>
          <StartupSplash visible={showSplash} onDone={() => setShowSplash(false)} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
