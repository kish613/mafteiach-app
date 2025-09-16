import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WoodCard from "./WoodCard";

export type TemplateKey = "sources" | "deep" | "practical" | "dispute" | "daf";

interface Props {
  language: "english" | "hebrew";
  recent: string[];
  suggested: string[];
  template: TemplateKey;
  onPick: (text: string) => void;
  onTemplateChange: (key: TemplateKey) => void;
}

function ui(language: "english" | "hebrew") {
  return (en: string, he: string) => (language === "hebrew" ? he : en);
}

const Chip = ({ label, onPress, icon, active = false }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; active?: boolean }) => (
  <Pressable
    onPress={onPress}
    className="px-3 py-2 rounded-xl mr-2 mb-2"
    style={{ backgroundColor: active ? "#7A3F19" : "#2F1B12", borderColor: "#8A5B2A", borderWidth: 1 }}
  >
    <View className="flex-row items-center">
      {icon ? <Ionicons name={icon} size={16} color="#C7954B" /> : null}
      <Text className="ml-2 text-sm" style={{ color: "#E7D1A8" }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);

export default function ChaburaQuickStart({ language, recent, suggested, template, onPick, onTemplateChange }: Props) {
  const t = ui(language);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <WoodCard className="mb-3" padded>
      <Text className="text-base font-semibold mb-3" style={{ color: "#E7D1A8", textAlign: language === "hebrew" ? "right" : "left" }}>{title}</Text>
      {children}
    </WoodCard>
  );

  const renderList = (items: string[]) => (
    <View className="flex-row flex-wrap">
      {items.map((q, i) => (
        <Chip key={`${q}-${i}`} label={q} onPress={() => onPick(q)} />
      ))}
    </View>
  );

  return (
    <View className="mt-6">
      {recent.length > 0 && (
        <Section title={t("Recent topics", "נושאים אחרונים")}>
          {renderList(recent)}
        </Section>
      )}

      {suggested.length > 0 && (
        <Section title={t("Suggested topics", "מוצע")}> 
          {renderList(suggested)}
        </Section>
      )}

      <Section title={t("Templates", "תבניות")}>
        <View className="flex-row flex-wrap">
          <Chip label={t("Sources only", "מקורות בלבד")} icon="document-outline" active={template === "sources"} onPress={() => onTemplateChange("sources")} />
          <Chip label={t("Deep-dive sugya", "עיון בסוגיא")} icon="library-outline" active={template === "deep"} onPress={() => onTemplateChange("deep")} />
          <Chip label={t("Practical halacha", "הלכה למעשה")} icon="briefcase-outline" active={template === "practical"} onPress={() => onTemplateChange("practical")} />
          <Chip label={t("Machlokes map", "מפת מחלוקת")} icon="git-branch-outline" active={template === "dispute"} onPress={() => onTemplateChange("dispute")} />
          <Chip label={t("Sources on the Daf", "מקורות על הדף") } icon="book-outline" active={template === "daf"} onPress={() => onTemplateChange("daf")} />
        </View>
      </Section>

      <WoodCard padded>
        <Text className="text-sm" style={{ color: "#C7B08B", textAlign: language === "hebrew" ? "right" : "left", lineHeight: 18 }}>
          {t("Tip: Keep your topic short. Add era hints like 'Gemara' or 'Acharonim' if relevant.", "טיפ: שמרו על נושא קצר. הוסיפו רמזי תקופה כמו 'גמרא' או 'אחרונים' אם צריך.")}
        </Text>
      </WoodCard>
    </View>
  );
}
