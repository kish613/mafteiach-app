import React from "react";
import { View, Text } from "react-native";
import { cn } from "../utils/cn";
import SourceCard from "./SourceCard";
import { TorahSource } from "../state/searchStore";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
  sources?: TorahSource[];
}

interface ChatMessageProps {
  message: ChatMessage;
  onSourceFavorite?: (source: TorahSource) => void;
  isSourceFavorite?: (source: TorahSource) => boolean;
  className?: string;
}

export default function ChatMessage({
  message,
  onSourceFavorite,
  isSourceFavorite,
  className,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <View className={cn("mb-4", className)}>
      <View
        className={cn(
          "max-w-[85%] p-3 rounded-2xl",
          isUser
            ? "bg-yellow-600 self-end rounded-br-md"
            : "bg-neutral-800 self-start rounded-bl-md"
        )}
      >
        <Text
          className={cn(
            "text-base leading-5",
            isUser ? "text-black" : "text-white"
          )}
        >
          {message.content}
        </Text>
      </View>

      {/* Sources for assistant messages */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <View className="mt-3 ml-2">
          <Text className="text-neutral-400 text-sm mb-2">Sources:</Text>
          {message.sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onFavoritePress={onSourceFavorite}
              isFavorite={isSourceFavorite?.(source) || false}
              className="mb-2"
            />
          ))}
        </View>
      )}

      {/* Timestamp */}
      <Text
        className={cn(
          "text-xs text-neutral-500 mt-1",
          isUser ? "text-right" : "text-left"
        )}
      >
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}