import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "hebrew" | "english" | "both";

interface AppState {
  language: Language;
  numberOfSources: number;
  textScale: number; // 0.8 - 1.6
  lineHeight: number; // 1.1 - 1.8
  justifyText: boolean;
  setLanguage: (language: Language) => void;
  setNumberOfSources: (count: number) => void;
  setTextScale: (scale: number) => void;
  setLineHeight: (lh: number) => void;
  setJustifyText: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: "both",
      numberOfSources: 25,
      textScale: 1.0,
      lineHeight: 1.35,
      justifyText: false,
      setLanguage: (language) => set({ language }),
      setNumberOfSources: (numberOfSources) => {
        const validCount = Math.max(5, Math.min(50, Math.round(numberOfSources / 5) * 5));
        set({ numberOfSources: validCount });
      },
      setTextScale: (scale) => set({ textScale: Math.max(0.8, Math.min(1.6, scale)) }),
      setLineHeight: (lh) => set({ lineHeight: Math.max(1.1, Math.min(1.8, lh)) }),
      setJustifyText: (val) => set({ justifyText: val }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ language: s.language, numberOfSources: s.numberOfSources, textScale: s.textScale, lineHeight: s.lineHeight, justifyText: s.justifyText }),
    },
  ),
);