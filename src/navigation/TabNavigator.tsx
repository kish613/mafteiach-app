import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { woodTheme } from "../theme/wood";
import SearchStackNavigator from "./SearchStackNavigator";
import ChaburaScreen from "../screens/ChaburaScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Chabura") {
            iconName = focused ? "school" : "school-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#C7954B",
        tabBarInactiveTintColor: "#8B7A62",
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: "#6F4A2366",
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarBackground: () => {
          try {
            return (
              <LinearGradient
                colors={[woodTheme.colors.woodBgStart, woodTheme.colors.woodBgEnd]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1 }}
              />
            );
          } catch (e) {
            return <View style={{ flex: 1, backgroundColor: "#1A0C07" }} />;
          }
        },
        sceneContainerStyle: { backgroundColor: "transparent" },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Search" component={SearchStackNavigator} />
      <Tab.Screen name="Chabura" component={ChaburaScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}