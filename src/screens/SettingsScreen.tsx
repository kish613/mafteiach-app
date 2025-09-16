import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore, Language } from "../state/appStore";
import { useSearchStore } from "../state/searchStore";
import SourceCounter from "../components/SourceCounter";

export default function SettingsScreen() {
  const { language, numberOfSources, setLanguage, setNumberOfSources } = useAppStore();
  const { clearHistory } = useSearchStore();

  const languageOptions: { value: Language; label: string; description: string }[] = [
    { value: "english", label: "English", description: "Sources in English only" },
    { value: "hebrew", label: "לשון הקודש", description: "מקורות בלשון הקודש בלבד" },
    { value: "both", label: "Both / שניהם", description: "Sources in both languages" },
  ];

  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        {/* Header */}
        <View className="px-4 py-3 border-b border-neutral-800">
          <Text className="text-xl font-semibold" style={{ color: "#E7D1A8" }}>Settings</Text>
          <Text className="text-sm" style={{ color: "#C7B08B" }}>Customize your Mafteiach experience</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Language Settings */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4" style={{ color: "#E7D1A8" }}>Language Preference</Text>
            {languageOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                className="flex-row items-center justify-between rounded-xl p-4 mb-3"
                style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: "#E7D1A8" }}>{option.label}</Text>
                  <Text className="text-sm" style={{ color: "#C7B08B" }}>{option.description}</Text>
                </View>
                <View className="w-6 h-6 rounded-full items-center justify-center" style={{ borderColor: "#D2A35C", borderWidth: 2 }}>
                  {language === option.value && (
                    <View className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D2A35C" }} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Default Number of Sources */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4" style={{ color: "#E7D1A8" }}>Default Number of Sources</Text>
            <View className="rounded-xl p-6" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
              <SourceCounter
                value={numberOfSources}
                onValueChange={setNumberOfSources}
              />
            </View>
          </View>

          {/* Data Management */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4" style={{ color: "#E7D1A8" }}>Data Management</Text>
            
            <Pressable
              onPress={handleClearHistory}
              className="flex-row items-center justify-between rounded-xl p-4 mb-3"
              style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <View className="ml-3">
                  <Text className="text-base font-medium" style={{ color: "#E7D1A8" }}>Clear Search History</Text>
                  <Text className="text-sm" style={{ color: "#C7B08B" }}>Remove all saved searches</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C7B08B" />
            </Pressable>
          </View>

          {/* About */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4" style={{ color: "#E7D1A8" }}>About</Text>
            
            <View className="rounded-xl p-4" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: "#7A3F19" }}>
                  <View className="w-6 h-6 border-2 rounded-full" style={{ borderColor: "#8A5B2A" }}>
                    <View className="w-2 h-2 rounded-full absolute -right-0.5 top-0.5" style={{ backgroundColor: "#8A5B2A" }} />
                    <View className="w-1.5 h-1.5 rounded-full absolute -right-0.5 top-3" style={{ backgroundColor: "#8A5B2A" }} />
                  </View>
                  <Text className="text-xs font-bold" style={{ color: "#D2A35C" }}>מפתח</Text>
                </View>
                <Text className="text-xl font-bold" style={{ color: "#E7D1A8" }}>Mafteiach</Text>
                <Text className="text-sm" style={{ color: "#C7B08B" }}>Torah Source Navigator</Text>
              </View>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm" style={{ color: "#C7B08B" }}>Version</Text>
                  <Text className="text-sm" style={{ color: "#E7D1A8" }}>1.0.0</Text>
                </View>
              </View>
              
              <Text className="text-xs text-center mt-4 leading-4" style={{ color: "#B89367" }}>
                Mafteiach helps you find Torah, Gemara, and Halacha sources by providing relevant citations, 
                allowing you to study the original texts yourself.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center py-8">
            <Text className="text-xs" style={{ color: "#B89367" }}>
              Built with dedication to Torah learning
            </Text>
          </View>
        </ScrollView>
      </WoodBackground>
    </SafeAreaView>
  );
}