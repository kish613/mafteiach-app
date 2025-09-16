import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WoodCard from "./WoodCard";
import { TorahSource } from "../state/searchStore";
import { ChaburaOutline } from "../api/chabura";

interface Props {
  outline: ChaburaOutline;
  language: "english" | "hebrew";
  onCompare: (pair: TorahSource[]) => void;
  onExport: () => void;
  onSaveAllToFolder: () => void;
}

function useUIText(language: "english" | "hebrew") {
  return (en: string, he: string) => (language === "hebrew" ? he : en);
}

export default function ChaburaIdeas({ outline, language, onCompare, onExport, onSaveAllToFolder }: Props) {
  const uiText = useUIText(language);

  const allSources: TorahSource[] = useMemo(() => outline.sections.flatMap(s => s.sources as unknown as TorahSource[]), [outline]);

  const keyQuestions: string[] = useMemo(() => {
    const titles = outline.sections.map(s => s.titleHebrew).filter(Boolean);
    const qs: string[] = [];
    for (let i = 0; i < titles.length; i++) {
      const a = titles[i];
      const b = titles[(i + 1) % titles.length];
      if (a) {
        qs.push(
          uiText(`What is the core debate in ${a}?`, `מה המחלוקת המרכזית ב${a}?`),
        );
      }
      if (a && b && a !== b && qs.length < 6) {
        qs.push(
          uiText(`How does ${a} address ${b}?`, `איך ${a} מתמודד עם ${b}?`),
        );
      }
      if (qs.length >= 6) break;
    }
    // Deduplicate
    return Array.from(new Set(qs)).slice(0, 6);
  }, [outline, uiText]);

  const comparisonPairs: [TorahSource, TorahSource][] = useMemo(() => {
    const pairs: [TorahSource, TorahSource][] = [];
    const byCategory: Record<string, TorahSource[]> = {};
    for (const s of allSources) {
      const k = s.category ?? "other";
      byCategory[k] = byCategory[k] || [];
      byCategory[k].push(s);
    }
    const catOrder = ["gemara", "mishnah", "torah", "halacha", "other"] as const;
    const cats = catOrder.filter(c => byCategory[c]?.length);
    // Simple heuristic: take first of earliest cat vs later cat to generate 1-3 pairs
    for (let i = 0; i < cats.length - 1 && pairs.length < 3; i++) {
      const a = byCategory[cats[i]][0];
      const b = byCategory[cats[i + 1]][0];
      if (a && b && a.id !== b.id) {
        pairs.push([a, b]);
      }
    }
    // If still lacking, pair first two unique sources
    if (pairs.length === 0 && allSources.length >= 2) {
      pairs.push([allSources[0], allSources[1]]);
    }
    return pairs.slice(0, 3);
  }, [allSources]);

  const hasContent = keyQuestions.length > 0 || comparisonPairs.length > 0 || allSources.length > 0;
  if (!hasContent) return null;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text className="text-base font-semibold mb-3" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left" }}>{children}</Text>
  );

  const Pill = ({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) => (
    <Pressable onPress={onPress} className="px-3 py-2 rounded-xl mr-2 mb-2" style={{ backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}>
      <View className="flex-row items-center">
        <Ionicons name={icon} size={16} color="#C7954B" />
        <Text className="ml-2 text-sm" style={{ color: "#E7D1A8" }}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="mt-4">
      <Text className="text-sm mb-2" style={{ color: "#C7B08B", textAlign: language === "hebrew" ? "right" : "left" }}>
        {uiText("Ideas", "רעיונות")}
      </Text>

      {keyQuestions.length > 0 && (
        <WoodCard className="mb-3" padded>
          <SectionTitle>{uiText("Key Questions", "שאלות עיקריות")}</SectionTitle>
          {keyQuestions.map((q, idx) => (
            <View key={idx} className={idx > 0 ? "pt-3" : undefined}>
              {idx > 0 && <View style={{ borderTopColor: "#8A5B2A", borderTopWidth: 0.5, opacity: 0.4 }} />}
              <Text className="text-sm pt-3" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left", lineHeight: 18 }}>{q}</Text>
            </View>
          ))}
        </WoodCard>
      )}

      {comparisonPairs.length > 0 && (
        <WoodCard className="mb-3" padded>
          <SectionTitle>{uiText("Suggested Comparisons", "השוואות מוצעות")}</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{ paddingVertical: 4 }}>
              {comparisonPairs.map(([a, b], idx) => (
                <Pressable
                  key={idx}
                  onPress={() => onCompare([a, b])}
                  className="mr-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}
                >
                  <Text className="text-xs" style={{ color: "#E7D1A8" }}>
                    {`${a.location}  vs  ${b.location}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </WoodCard>
      )}

      <WoodCard padded>
        <SectionTitle>{uiText("Quick Actions", "פעולות מהירות")}</SectionTitle>
        <View className="flex-row flex-wrap">
          <Pill label={uiText("Export", "ייצוא")} icon="download-outline" onPress={onExport} />
          <Pill label={uiText("Share outline", "שיתוף מתווה")} icon="share-social-outline" onPress={onExport} />
          <Pill label={uiText("Save all to folder", "שמור הכל לתיקיה")} icon="folder-open" onPress={onSaveAllToFolder} />
        </View>
      </WoodCard>
    </View>
  );
}
