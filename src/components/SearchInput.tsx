import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../utils/cn";
import VoiceRecorder from "./VoiceRecorder";
import WoodCard from "./WoodCard";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onVoicePress?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  placeholder = "Enter your question",
  className,
}: SearchInputProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleVoicePress = () => {
    if (onVoicePress) {
      onVoicePress();
    } else {
      setShowVoiceModal(true);
    }
  };

  const handleTranscription = (text: string) => {
    onChangeText(text);
    setShowVoiceModal(false);
  };
  return (
    <>
      <WoodCard className={cn("", className)}>
        <View className="flex-row items-center">
          <Ionicons name="search" size={20} color="#D2A35C" />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#E7D1A899"
            className="flex-1 text-base ml-3"
            style={{ color: "#E7D1A8" }}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            multiline={false}
          />
          <Pressable onPress={handleVoicePress} className="ml-3">
            <Ionicons name="mic" size={20} color="#D2A35C" />
          </Pressable>
        </View>
      </WoodCard>

      {/* Voice Recording Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View className="flex-1 bg-black/80 items-center justify-center">
          <View className="bg-neutral-900 rounded-3xl p-8 mx-8 items-center">
            <VoiceRecorder onTranscription={handleTranscription} />
            <Pressable
              onPress={() => setShowVoiceModal(false)}
              className="mt-6 px-6 py-2 bg-neutral-700 rounded-xl"
            >
              <Text className="text-white text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}