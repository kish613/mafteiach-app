import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSearchStore, SearchResult } from "../state/searchStore";
import SourceCard from "../components/SourceCard";
import { TorahSource } from "../state/searchStore";

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  
  const {
    searchHistory,
    favorites,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
  } = useSearchStore();
  const setCurrentQuery = useSearchStore(s => s.setCurrentQuery);
  const setCurrentResults = useSearchStore(s => s.setCurrentResults);

  const handleSourceFavorite = (source: TorahSource) => {
    const isFavorite = favorites.some(fav => fav.id === source.id);
    if (isFavorite) {
      removeFromFavorites(source.id);
    } else {
      addToFavorites(source);
    }
  };

  const isSourceFavorite = (source: TorahSource) => {
    return favorites.some(fav => fav.id === source.id);
  };

  const filteredHistory = searchHistory.filter(item =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = favorites.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openHistoryItem = (item: SearchResult) => {
    setCurrentQuery(item.query);
    setCurrentResults(item.sources);
    // Navigate to nested Search Results screen in Search tab
    (navigation as any).navigate("Search", { screen: "SearchResults" });
  };

  const renderHistoryItem = (item: SearchResult) => {
    const lang = item.language === "hebrew" ? "לש" : item.language === "english" ? "EN" : "Both";
    return (
      <Pressable
        key={item.id}
        onPress={() => openHistoryItem(item)}
        className="mb-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-base font-medium flex-1" numberOfLines={2}>
            {item.query}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#C7954B" />
        </View>
        <View className="flex-row items-center mt-2" style={{ gap: 12 }}>
          <Text className="text-neutral-500 text-xs">
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          <Text className="text-neutral-500 text-xs">
            {item.sources.length} sources
          </Text>
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
            <Text className="text-xs" style={{ color: "#C7B08B" }}>{lang}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        {/* Header */}
        <View className="px-4 py-3 border-b border-neutral-800">
          <Text className="text-xl font-semibold mb-3" style={{ color: "#E7D1A8" }}>History & Favorites</Text>
          
          {/* Search Input */}
          <View className="flex-row items-center rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
            <Ionicons name="search" size={16} color="#D2A35C" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search history or favorites..."
              placeholderTextColor="#E7D1A899"
              className="flex-1 text-sm ml-2"
              style={{ color: "#E7D1A8" }}
            />
          </View>
          
          {/* Tabs */}
          <View className="flex-row">
            <Pressable
              onPress={() => setActiveTab("history")}
              className="flex-1 py-2 px-4 rounded-l-lg"
              style={{ backgroundColor: activeTab === "history" ? "#7A3F19" : "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
            >
              <Text className="text-center font-medium" style={{ color: activeTab === "history" ? "#E7D1A8" : "#C7B08B" }}>
                History ({filteredHistory.length}/{searchHistory.length})
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setActiveTab("favorites")}
              className="flex-1 py-2 px-4 rounded-r-lg"
              style={{ backgroundColor: activeTab === "favorites" ? "#7A3F19" : "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
            >
              <Text className="text-center font-medium" style={{ color: activeTab === "favorites" ? "#E7D1A8" : "#C7B08B" }}>
                Favorites ({filteredFavorites.length}/{favorites.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {activeTab === "history" ? (
            <>
              {filteredHistory.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Ionicons name="time-outline" size={64} color="#8B8B8B" />
                  <Text className="text-lg mt-4" style={{ color: "#C7B08B" }}>
                    {searchHistory.length === 0 ? "No search history" : "No matching searches"}
                  </Text>
                  <Text className="text-sm text-center mt-2" style={{ color: "#B89367" }}>
                    {searchHistory.length === 0 
                      ? "Your search history will appear here" 
                      : "Try a different search term"
                    }
                  </Text>
                </View>
              ) : (
                <>
                  {searchHistory.length > 0 && (
                    <Pressable
                      onPress={clearHistory}
                      className="rounded-lg py-2 px-4 self-end mb-4"
                      style={{ backgroundColor: "#7A3F19" }}
                    >
                      <Text className="text-sm font-medium" style={{ color: "#E7D1A8" }}>Clear History</Text>
                    </Pressable>
                  )}
                  {filteredHistory.map(renderHistoryItem)}
                </>
              )}
            </>
          ) : (
            <>
              {filteredFavorites.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Ionicons name="heart-outline" size={64} color="#8B8B8B" />
                  <Text className="text-lg mt-4" style={{ color: "#C7B08B" }}>
                    {favorites.length === 0 ? "No favorites yet" : "No matching favorites"}
                  </Text>
                  <Text className="text-sm text-center mt-2" style={{ color: "#B89367" }}>
                    {favorites.length === 0 
                      ? "Tap the heart icon on sources to save them here" 
                      : "Try a different search term"
                    }
                  </Text>
                </View>
              ) : (
                filteredFavorites.map((source) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    onFavoritePress={handleSourceFavorite}
                    isFavorite={true}
                    className="mb-4"
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </WoodBackground>
    </SafeAreaView>
  );
}
