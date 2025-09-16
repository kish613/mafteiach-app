import React from "react";
import { View, Text, Modal, ScrollView } from "react-native";
import { TorahSource } from "../state/searchStore";
import HebrewText from "./HebrewText";

interface Props {
  visible: boolean;
  onClose: () => void;
  sources: TorahSource[];
}

export default function CompareSheet({ visible, onClose, sources }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60">
        <View className="flex-1 mt-auto rounded-t-3xl" style={{ backgroundColor: "#22140E" }}>
          <View className="flex-row justify-between items-center px-4 py-3 border-b" style={{ borderColor: "#8A5B2A" }}>
            <Text className="text-base" style={{ color: "#E7D1A8" }}>Compare sources</Text>
            <Text onPress={onClose} style={{ color: "#C7954B" }}>Close</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            {sources.map((s) => (
              <View key={s.id} className="w-80 px-4 py-4 border-r" style={{ borderColor: "#3B1D0F" }}>
                <HebrewText className="text-yellow-600 text-sm mb-2" isHebrew>{s.location}</HebrewText>
                <HebrewText className="text-white text-lg font-semibold mb-2" isHebrew>{s.title}</HebrewText>
                <HebrewText className="text-neutral-300" isHebrew>{s.text}</HebrewText>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
