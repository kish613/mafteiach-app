import React, { useEffect, useState } from "react";
import Animated, { useSharedValue, withTiming, withDelay, useDerivedValue, runOnJS } from "react-native-reanimated";
import HebrewText from "./HebrewText";

interface TypingTextProps {
  text: string;
  isHebrew?: boolean;
  speedCharsPerSec?: number; // default 40 cps
  delayMs?: number; // delay before starting animation
  className?: string;
  style?: any;
  onDone?: () => void;
}

export default function TypingText({ text, isHebrew, speedCharsPerSec = 40, delayMs = 0, className, style, onDone }: TypingTextProps) {
  const [shown, setShown] = useState("");
  const length = text?.length ?? 0;
  const progress = useSharedValue(0);

  useEffect(() => {
    const dur = Math.max(200, Math.min(6000, (length / Math.max(1, speedCharsPerSec)) * 1000));
    progress.value = withDelay(delayMs, withTiming(1, { duration: dur }, (finished) => {
      if (finished && onDone) runOnJS(onDone)();
    }));
  }, [length, speedCharsPerSec, delayMs]);

  useDerivedValue(() => {
    const n = Math.max(0, Math.min(length, Math.floor(progress.value * length)));
    // speed up if text is very long
    if (length > 1200) {
      const fast = Math.max(800, Math.floor(length * 0.7));
      const display = text.slice(0, n > fast ? length : n);
      runOnJS(setShown)(display);
      return;
    }
    runOnJS(setShown)(text.slice(0, n));
  }, [text]);

  return (
    <HebrewText isHebrew={!!isHebrew} className={className} style={style}>
      {shown}
    </HebrewText>
  );
}
