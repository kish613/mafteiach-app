import React from "react";
import { Text, TextProps, Platform } from "react-native";
import { cn } from "../utils/cn";
import { useAppStore } from "../state/appStore";

interface HebrewTextProps extends TextProps {
  children: React.ReactNode;
  isHebrew?: boolean;
  className?: string;
}

export default function HebrewText({ 
  children, 
  isHebrew = false, 
  className, 
  style,
  ...props 
}: HebrewTextProps) {
  const textScale = useAppStore(s => s.textScale);
  const lineHeight = useAppStore(s => s.lineHeight);
  const justifyText = useAppStore(s => s.justifyText);

  const containsHebrew = typeof children === "string" && /[\u0590-\u05FF]/.test(children);
  const shouldUseRTL = isHebrew || containsHebrew;

  const fontFamily = shouldUseRTL ? (Platform.OS === "ios" ? "Arial Hebrew" : "serif") : undefined;
  const combinedStyle = [
    shouldUseRTL && {
      writingDirection: "rtl",
      textAlign: justifyText ? "justify" : "right",
    },
    {
      transform: [{ scale: textScale }],
      lineHeight: (style as any)?.fontSize ? (style as any).fontSize * lineHeight : undefined,
      fontFamily,
    },
    style,
  ];

  return (
    <Text
      {...props}
      className={cn(className)}
      style={combinedStyle as any}
    >
      {children}
    </Text>
  );
}
