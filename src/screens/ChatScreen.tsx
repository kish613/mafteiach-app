import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../state/appStore";
import { useSearchStore } from "../state/searchStore";
import { searchTorahSources } from "../api/torah-sources";
import ChatMessage, { ChatMessage as ChatMessageType } from "../components/ChatMessage";
import { TorahSource } from "../state/searchStore";

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { language, numberOfSources } = useAppStore();
  const { favorites, addToFavorites, removeFromFavorites, error, setError } = useSearchStore();

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: inputText.trim(),
      role: "user",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Search for sources based on the user's question
      const sources = await searchTorahSources({
        query: inputText.trim(),
        numberOfSources: Math.min(numberOfSources, 10), // Limit for chat
        language,
      });

      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        content: `I found ${sources.length} relevant sources for your question. Please review the sources below to find your answer.`,
        role: "assistant",
        timestamp: Date.now(),
        sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setError("Something went wrong fetching sources. Please try again.");
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        content: "Something went wrong fetching sources. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Scroll to bottom after a short delay
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

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

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        <KeyboardAvoidingView 
          className="flex-1" 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-neutral-800">
            <Text className="text-xl font-semibold" style={{ color: "#E7D1A8" }}>Torah Chat</Text>
            <Text className="text-sm" style={{ color: "#C7B08B" }}>Ask questions and get source citations</Text>
          </View>

          {/* Error banner */}
          {error && (
            <View className="mx-4 mt-3 rounded-xl overflow-hidden border" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A" }}>
              <Text className="px-4 py-3 text-sm" style={{ color: "#E7D1A8" }}>{error}</Text>
              <View className="flex-row justify-end border-t" style={{ borderColor: "#8A5B2A" }}>
                <Pressable onPress={() => setError(null)} className="px-4 py-2">
                  <Text style={{ color: "#C7954B" }}>Dismiss</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 py-4"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="chatbubbles-outline" size={64} color="#8B8B8B" />
                <Text className="text-lg mt-4" style={{ color: "#C7B08B" }}>Start a conversation</Text>
                <Text className="text-sm text-center mt-2" style={{ color: "#B89367" }}>
                  Ask any question about Torah, Gemara, or Halacha
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSourceFavorite={handleSourceFavorite}
                  isSourceFavorite={isSourceFavorite}
                />
              ))
            )}
            
            {isLoading && (
              <View className="flex-row items-center justify-center py-4">
                <Text className="text-sm" style={{ color: "#C7B08B" }}>Searching for sources...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="flex-row items-center px-4 py-3 border-t border-neutral-800">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              placeholderTextColor="#E7D1A899"
              className="flex-1 rounded-2xl px-4 py-3 mr-3"
              style={{ backgroundColor: "#3B1D0F", color: "#E7D1A8", borderColor: "#8A5B2A", borderWidth: 1 }}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: inputText.trim() && !isLoading ? "#7A3F19" : "#2F150B", borderColor: "#8A5B2A", borderWidth: 1 }}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() && !isLoading ? "#E7D1A8" : "#8B8B8B"} 
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </WoodBackground>
    </SafeAreaView>
  );
}