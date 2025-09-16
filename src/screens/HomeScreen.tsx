import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Keyboard, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../state/appStore";
import { useSearchStore } from "../state/searchStore";
import { searchTorahSources } from "../api/torah-sources";
import { SearchStackParamList } from "../navigation/SearchStackNavigator";
import AppLogo from "../components/AppLogo";
import SearchInput from "../components/SearchInput";
import SourceCounter from "../components/SourceCounter";
import SearchButton from "../components/SearchButton";
import SuggestionCard from "../components/SuggestionCard";
import { suggestSimilarTopicsAsync } from "../utils/history-cluster";

type HomeScreenNavigationProp = NativeStackNavigationProp<SearchStackParamList, "Home">;

const EXAMPLE_QUESTIONS = [
  "What are the laws of Shabbat candle lighting?",
  "When is the proper time for Mincha prayer?",
  "What are the requirements for a kosher sukkah?",
  "How should one conduct themselves during the month of Elul?",
];

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [similar, setSimilar] = useState<string[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { numberOfSources, setNumberOfSources, language } = useAppStore();
  const { 
    isLoading, 
    setLoading, 
    setError, 
    setCurrentQuery, 
    setCurrentResults, 
    addToHistory,
    error,
    searchHistory,
  } = useSearchStore();

  useEffect(() => {
    let active = true;
    setSimilarLoading(true);
    suggestSimilarTopicsAsync(searchHistory, 4)
      .then(r => { if (!active) return; setSimilar(r || []); })
      .catch(() => { if (!active) return; setSimilar([]); })
      .finally(() => { if (!active) return; setSimilarLoading(false); });
    return () => { active = false; };
  }, [searchHistory]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      const sources = await searchTorahSources({
        query: query.trim(),
        numberOfSources,
        language,
      });

      setCurrentResults(sources);
      
      // Add to search history
      addToHistory({
        id: `search-${Date.now()}`,
        query: query.trim(),
        sources,
        timestamp: Date.now(),
        language,
      });

      // Navigate to results
      navigation.navigate("SearchResults");
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleVoicePress = () => {
    // TODO: Implement voice input
    console.log("Voice input pressed");
  };

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* App Logo and Title */}
          <AppLogo className="mb-6" />

          {/* Error banner */}
          {error && (
            <View className="mb-6 rounded-xl overflow-hidden border" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A" }}>
              <Text className="px-4 py-3 text-sm" style={{ color: "#E7D1A8" }}>{error}</Text>
              <View className="flex-row justify-end border-t" style={{ borderColor: "#8A5B2A" }}>
                <Pressable onPress={() => setError(null)} className="px-4 py-2">
                  <Text style={{ color: "#C7954B" }}>Dismiss</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Search Input */}
          <SearchInput
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSearch}
            onVoicePress={handleVoicePress}
            className="mb-8"
          />

          {/* Source Counter */}
          <SourceCounter
            value={numberOfSources}
            onValueChange={setNumberOfSources}
            className="mb-8"
          />

          {/* Search Button */}
          <SearchButton
            onPress={handleSearch}
            disabled={!query.trim()}
            loading={isLoading}
            className="mb-10"
          />

          {/* Similar topics (from history) */}
          {(similarLoading || similar.length > 0) && (
            <View className="mb-8">
              <Text className="text-xl font-semibold mb-4" style={{ color: "#E7D1A8" }}>Similar topics</Text>
              {similarLoading ? (
                <>
                  <View className="mb-3 h-12 rounded-lg" style={{ backgroundColor: "#3B1D0F" }} />
                  <View className="mb-3 h-12 rounded-lg" style={{ backgroundColor: "#3B1D0F" }} />
                  <View className="mb-3 h-12 rounded-lg" style={{ backgroundColor: "#3B1D0F" }} />
                </>
              ) : (
                similar.map((term, idx) => (
                  <SuggestionCard key={`similar-${idx}`} question={term} onPress={handleSuggestionPress} className="mb-3" />
                ))
              )}
            </View>
          )}

          {/* Try Asking Section */}
          <View>
            <Text className="text-xl font-semibold mb-4" style={{ color: "#E7D1A8" }}>Try asking:</Text>
            {EXAMPLE_QUESTIONS.map((question, index) => (
              <SuggestionCard
                key={index}
                question={question}
                onPress={handleSuggestionPress}
                className="mb-3"
              />
            ))}
          </View>
        </ScrollView>
      </WoodBackground>
    </SafeAreaView>
  );
}