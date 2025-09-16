import React from "react";
import { Text, Pressable } from "react-native";
import { cn } from "../utils/cn";
import WoodCard from "./WoodCard";

interface SuggestionCardProps {
  question: string;
  onPress: (question: string) => void;
  className?: string;
}

export default function SuggestionCard({
  question,
  onPress,
  className,
}: SuggestionCardProps) {
  return (
    <WoodCard className={cn("", className)}>
      <Pressable onPress={() => onPress(question)}>
        <Text className="text-base leading-5" style={{ color: "#E7D1A8" }}>{question}</Text>
        <Text className="text-sm mt-2" style={{ color: "#C7B08B" }}>Tap to use this question</Text>
      </Pressable>
    </WoodCard>
  );
}