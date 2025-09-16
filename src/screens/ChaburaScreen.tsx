import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import WoodBackground from "../components/WoodBackground";
import { Ionicons } from "@expo/vector-icons";
import { compileChaburaOutline, ChaburaOutline } from "../api/chabura";
import { useAppStore } from "../state/appStore";
import { useSearchStore, TorahSource } from "../state/searchStore";
import SourceCard from "../components/SourceCard";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import WoodCard from "../components/WoodCard";
import SugyaMap from "../components/SugyaMap";
import ChaburaQuickStart, { TemplateKey } from "../components/ChaburaQuickStart";
import ChaburaIdeas from "../components/ChaburaIdeas";
import CompareSheet from "../components/CompareSheet";
import { suggestSimilarTopicsAsync } from "../utils/history-cluster";
import { getTodaysDaf } from "../api/jewish-calendar";

export default function ChaburaScreen() {
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<ChaburaOutline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showMap, setShowMap] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [comparePair, setComparePair] = useState<TorahSource[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("sources");
  const [suggested, setSuggested] = useState<string[]>([]);

  const scrollViewRef = useRef<ScrollView>(null);
  const exportRef = useRef<View>(null);

  const { language, setLanguage } = useAppStore();
  const { setError, error, createFolder, assignToFolder, searchHistory } = useSearchStore();

  const uiText = (en: string, he: string) => (language === "hebrew" ? he : en);

  const recentTopics = useMemo(() => {
    const seen = new Set<string>();
    const arr: string[] = [];
    for (const h of searchHistory) {
      const q = (h.query || "").trim();
      if (!q) continue;
      const key = q.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      arr.push(q);
      if (arr.length >= 8) break;
    }
    return arr;
  }, [searchHistory]);

  useEffect(() => {
    let active = true;
    suggestSimilarTopicsAsync(searchHistory, 6)
      .then(r => { if (!active) return; setSuggested(r || []); })
      .catch(() => { if (!active) return; setSuggested([]); });
    return () => { active = false; };
  }, [searchHistory]);

  const templateExtra = useMemo(() => {
    switch (selectedTemplate) {
      case "deep":
        return "הדגש על סוגיות ושיטות, חיבורים בין מקורות.";
      case "practical":
        return "מיקוד בפוסקים ומעשה בני זמננו.";
      case "dispute":
        return "הדגש על מחלוקות עיקריות וקווי תמיכה/קושיה.";
      default:
        return "";
    }
  }, [selectedTemplate]);

  const startOutline = async () => {
    let q = topic.trim();
    let extra = templateExtra;

    if (selectedTemplate === "daf") {
      const info = await getTodaysDaf();
      if (info) {
        const en = info.displayEn || info.ref;
        const he = info.displayHe || info.heRef || info.ref;
        if (!q) q = uiText(`Sources on the Daf: ${en}`, `מקורות על הדף: ${he}`);
        extra = `${extra}\nהתבסס על הדף היומי של היום: ${he || en}. הצג מקורות העוסקים בתמות ובנושאים המרכזיים העולים בדף, קשרים לסוגיות מקבילות, וראשונים/אחרונים שמבהירים את התמות.`;
      }
    }

    if (!q) return;
    try {
      const result = await compileChaburaOutline(q, 12, extra);
      setOutline(result);
      setExpanded({});
      setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (e) {
      setError(uiText("Something went wrong building the chabura. Please try again.", "משהו השתבש בעת יצירת החבורה. נסו שוב."));
    }
  };

  const handleBuild = async () => {
    const q = topic.trim();
    if ((selectedTemplate !== "daf" && !q) || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutline(null);

    try {
      await startOutline();
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  };

  const exportAsImage = async () => {
    if (!outline || !exportRef.current) return;
    try {
      const uri = await captureRef(exportRef, {
        format: "png",
        quality: 0.95,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: uiText("Share chabura outline", "שיתוף מתווה חבורה"),
      });
    } catch (e) {
      setError(uiText("Failed to export. Please try again.", "הייצוא נכשל. נסו שוב."));
    }
  };

  const toggleSection = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: prev[idx] === false }));
  };

  const handleCompare = (pair: TorahSource[]) => {
    setComparePair(pair);
    setCompareVisible(true);
  };

  const saveAllToFolder = () => {
    if (!outline) return;
    try {
      const id = createFolder(uiText("Chabura - ", "חבורה - ") + topic.slice(0, 40));
      const all = outline.sections.flatMap(s => s.sources);
      all.forEach(s => assignToFolder(s.id, id));
    } catch (e) {
      setError(uiText("Could not save to folder. Please try again.", "לא ניתן לשמור לתיקיה. נסו שוב."));
    }
  };

  const SectionSkeleton = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      <WoodCard className="mb-4" padded>
        <View className="h-5 w-2/3 mb-3 rounded" style={{ backgroundColor: "#3B1D0F" }} />
        <View className="h-4 w-full mb-2 rounded" style={{ backgroundColor: "#3B1D0F" }} />
        <View className="h-4 w-5/6 rounded" style={{ backgroundColor: "#3B1D0F" }} />
      </WoodCard>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1">
      <WoodBackground>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {/* Header with language switch and export button */}
          <View className="px-4 py-3 border-b border-neutral-800 flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Pressable
                onPress={outline ? exportAsImage : undefined}
                disabled={!outline}
                className="px-3 py-2 rounded-lg"
                style={{ opacity: outline ? 1 : 0.5, backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="download-outline" size={18} color="#C7954B" />
                  <Text className="ml-2" style={{ color: "#E7D1A8" }}>{uiText("Export", "ייצוא")}</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={outline ? () => setShowMap(true) : undefined}
                disabled={!outline}
                className="px-3 py-2 rounded-lg"
                style={{ opacity: outline ? 1 : 0.5, backgroundColor: "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="map-outline" size={18} color="#C7954B" />
                  <Text className="ml-2" style={{ color: "#E7D1A8" }}>{uiText("Sugya Map", "מפת סוגיא")}</Text>
                </View>
              </Pressable>
            </View>
            <View className="flex-row rounded-xl overflow-hidden" style={{ borderColor: "#8A5B2A", borderWidth: 1, backgroundColor: "#2F1B12" }}>
              <Pressable onPress={() => setLanguage("english")} className="px-3 py-2">
                <Text style={{ color: language === "english" ? "#E7D1A8" : "#8B8B8B" }}>EN</Text>
              </Pressable>
              <Pressable onPress={() => setLanguage("hebrew")} className="px-3 py-2 border-l" style={{ borderColor: "#8A5B2A" }}>
                <Text style={{ color: language === "hebrew" ? "#E7D1A8" : "#8B8B8B" }}>לש</Text>
              </Pressable>
            </View>
          </View>

          {/* Title and subtitle according to language */}
          <View className="px-4 pt-3 pb-1">
            <Text className="text-xl font-semibold" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left" }}>
              {uiText("Chabura Mode", "מצב חבורה")}
            </Text>
            <Text className="text-sm mt-1" style={{ color: "#C7B08B", lineHeight: 18, textAlign: language === "hebrew" ? "right" : "left" }}>
              {uiText("Enter a topic and get a shiur klali outline: sources only", "כתבו נושא, קבלו מתווה שיעור כללי: מקורות בלבד")}
            </Text>
          </View>

          {/* Error banner */}
          {error && (
            <View className="mx-4 mt-3 rounded-xl overflow-hidden border" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A" }}>
              <Text className="px-4 py-3 text-sm" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left" }}>{error}</Text>
              <View className="flex-row justify-end border-t" style={{ borderColor: "#8A5B2A" }}>
                <Pressable onPress={() => setError(null)} className="px-4 py-2">
                  <Text style={{ color: "#C7954B" }}>{uiText("Dismiss", "סגור")}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Input */}
          <View className="px-4 py-3 border-b border-neutral-800">
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder={uiText("Chabura topic", "נושא החבורה")}
              placeholderTextColor="#E7D1A899"
              className="rounded-3xl px-5 py-4"
              style={{ backgroundColor: "#3B1D0F", color: "#E7D1A8", borderColor: "#8A5B2A", borderWidth: 1, textAlign: language === "hebrew" ? "right" : "left", minHeight: 64, fontSize: 16 }}
              multiline
              maxLength={300}
              returnKeyType="done"
              onSubmitEditing={handleBuild}
            />
            <Text className="text-xs mt-2" style={{ color: "#B89367", textAlign: language === "hebrew" ? "right" : "left" }}>
              {uiText("Examples: Shabbat cooking; Eruv hotzaah; Yichud in workplace", "דוגמאות: בישול בשבת; הוצאה בעירוב; יחוד במקום עבודה")}
            </Text>
            <Pressable
              onPress={handleBuild}
              disabled={!topic.trim() || isLoading}
              className="mt-3 rounded-2xl py-3 items-center"
              style={{ backgroundColor: topic.trim() && !isLoading ? "#7A3F19" : "#2F150B", borderColor: "#8A5B2A", borderWidth: 1 }}
            >
              <Text style={{ color: topic.trim() && !isLoading ? "#E7D1A8" : "#8B8B8B" }}>
                {isLoading ? uiText("Building...", "בונה חבורה...") : uiText("Build Chabura", "בנה חבורה")}
              </Text>
            </Pressable>
          </View>

          {/* Results */}
          <ScrollView ref={scrollViewRef} className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {isLoading && !outline ? (
              <>
                <SectionSkeleton />
                <SectionSkeleton />
                <SectionSkeleton />
              </>
             ) : outline ? (<>
              <ViewShot ref={exportRef} options={{ format: "png", quality: 0.95 }}>
                <View>
                  <Text className="mb-3 text-sm" style={{ color: "#C7B08B", textAlign: language === "hebrew" ? "right" : "left", lineHeight: 18 }}>{outline.introNoteHebrew}</Text>
                   {outline.sections.map((section, idx) => {
                     const open = expanded[idx] !== false;
                     return (
                       <Animated.View key={`sec-${idx}`} entering={FadeInDown.delay(idx*70).duration(400)}>
                         <WoodCard className="mb-4">
                        <Pressable onPress={() => toggleSection(idx)} className="flex-row items-center justify-between mb-2">
                          <Text className="text-lg font-semibold" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left", flex: 1 }}>
                            {section.titleHebrew}
                          </Text>
                          <View className="flex-row items-center" style={{ gap: 8 }}>
                            <View className="px-2 py-1 rounded-full" style={{ backgroundColor: "#3B1D0F", borderColor: "#8A5B2A", borderWidth: 1 }}>
                              <Text className="text-xs" style={{ color: "#C7B08B" }}>{section.sources.length}</Text>
                            </View>
                            <Ionicons name={open ? "chevron-down" : "chevron-forward"} size={18} color="#C7954B" />
                          </View>
                        </Pressable>
                        {open && (
                          <View>
                            {section.sources.map((src, i) => (
                              <Animated.View key={src.id} entering={FadeInDown.delay(idx*70 + i*60).duration(350)}>
                                {i > 0 && <View style={{ borderTopColor: "#8A5B2A", borderTopWidth: 0.5, opacity: 0.4, marginVertical: 8 }} />}
                                <SourceCard source={{ ...src, language: "hebrew" }} className="mb-1" animate animateDelayMs={idx*70 + i*80} />
                              </Animated.View>
                            ))}
                          </View>
                        )}
                      </WoodCard>
                      </Animated.View>
                     );
                  })}
                </View>
              </ViewShot>
                 <ChaburaIdeas
                   outline={outline}
                   language={language === "hebrew" ? "hebrew" : "english"}
                   onCompare={handleCompare}
                   onExport={exportAsImage}
                   onSaveAllToFolder={saveAllToFolder}
                 />
                </>
             ) : (<>
              <View className="items-center justify-center py-16">
                <Ionicons name="school-outline" size={64} color="#8B8B8B" />
                <Text className="text-lg mt-4" style={{ color: "#C7B08B" }}>{uiText("Enter a topic to begin", "כתבו נושא לחבורה")}</Text>
                <Text className="text-sm mt-2" style={{ color: "#B89367", textAlign: "center", lineHeight: 18 }}>{uiText("You will get a shiur klali outline built only from sources across eras", "המערכת תאסוף מקורות מכל התקופות לפי מתווה שיעור כללי (מקורות בלבד)")}</Text>
              </View>
              <ChaburaQuickStart
                language={language === "hebrew" ? "hebrew" : "english"}
                recent={recentTopics}
                suggested={suggested}
                template={selectedTemplate}
                onPick={(text)=>{ setTopic(text); setTimeout(()=> scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 50); }}
                onTemplateChange={(k)=> setSelectedTemplate(k)}
              />
              </>
            )}
          </ScrollView>
          {/* Sugya Map Modal */}
          {outline && (
            <>
              <SugyaMap
                visible={showMap}
                onClose={() => setShowMap(false)}
                sources={outline.sections.flatMap(s => s.sources)}
              />
              <CompareSheet
                visible={compareVisible}
                onClose={() => setCompareVisible(false)}
                sources={comparePair}
              />
            </>
          )}
        </KeyboardAvoidingView>
      </WoodBackground>
    </SafeAreaView>
  );
}
