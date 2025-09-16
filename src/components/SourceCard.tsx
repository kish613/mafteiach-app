import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TorahSource } from "../state/searchStore";
import { cn } from "../utils/cn";
import HebrewText from "./HebrewText";
import TypingText from "./TypingText";

interface SourceCardProps {
  source: TorahSource;
  onPress?: (source: TorahSource) => void;
  onLongPress?: (source: TorahSource) => void;
  onFavoritePress?: (source: TorahSource) => void;
  onFolderPress?: (source: TorahSource) => void;
  isFavorite?: boolean;
  selected?: boolean;
   className?: string;
   animate?: boolean;
   animateDelayMs?: number;
}

export default function SourceCard({
  source,
  onPress,
  onLongPress,
  onFavoritePress,
  onFolderPress,
  isFavorite = false,
  selected = false,
  className,
  animate = false,
  animateDelayMs = 0,
}: SourceCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "torah":
        return "bg-blue-600";
      case "gemara":
        return "bg-purple-600";
      case "mishnah":
        return "bg-green-600";
      case "halacha":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "torah":
        return "Torah";
      case "gemara":
        return "Gemara";
      case "mishnah":
        return "Mishnah";
      case "halacha":
        return "Halacha";
      default:
        return "Other";
    }
  };

  return (
    <Pressable
      onPress={() => onPress?.(source)}
      onLongPress={() => onLongPress?.(source)}
      className={cn(
        "bg-neutral-800 rounded-xl p-4 border border-neutral-700",
        selected && "border-yellow-600",
        className
      )}
    >
      {/* Header with category and favorite button */}
      <View className="flex-row items-center justify-between mb-3">
        <View className={cn("px-2 py-1 rounded-full", getCategoryColor(source.category))}>
          <Text className="text-white text-xs font-medium">
            {getCategoryLabel(source.category)}
          </Text>
        </View>
        
        <View className="flex-row items-center" style={{ gap: 12 }}>
          {onFolderPress && (
            <Pressable onPress={() => onFolderPress(source)}>
              <Ionicons name="folder-open" size={20} color="#C7B08B" />
            </Pressable>
          )}
          {onFavoritePress && (
            <Pressable onPress={() => onFavoritePress(source)}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? "#D4AF37" : "#8B8B8B"}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Source title */}
      <HebrewText 
        className="text-white text-lg font-semibold mb-1"
        isHebrew={source.language === "hebrew"}
      >
        {source.title}
      </HebrewText>

      {/* Source location */}
      <HebrewText 
        className="text-yellow-600 text-sm font-medium mb-3"
        isHebrew={source.language === "hebrew"}
      >
        {source.location}
      </HebrewText>

      {/* Source text */}
      {animate ? (
        <TypingText
          text={source.text}
          isHebrew={source.language === "hebrew"}
          className="text-neutral-300 text-sm leading-5"
          delayMs={animateDelayMs}
        />
      ) : (
        <HebrewText 
          className="text-neutral-300 text-sm leading-5"
          isHebrew={source.language === "hebrew"}
        >
          {source.text}
        </HebrewText>
      )}

      {/* Language indicator */}
      <View className="flex-row justify-end mt-3">
        <Text className="text-neutral-500 text-xs">
          {source.language === "hebrew" ? "לשון הקודש" : "English"}
        </Text>
      </View>
    </Pressable>
  );
}