import { getOpenAITextResponse } from "./chat-service";
import { TorahSource } from "../state/searchStore";

export interface ChaburaSection {
  titleHebrew: string;
  sources: TorahSource[];
}

export interface ChaburaOutline {
  introNoteHebrew: string; // short Hebrew note explaining how the shiur is structured
  sections: ChaburaSection[];
}

export async function compileClarifyingQuestions(topic: string, uiLanguage: "hebrew" | "english"): Promise<string[]> {
  const system = uiLanguage === "hebrew"
    ? "אתה מסייע לחדד נושא חבורה. החזר רשימת שאלות קצרות (2-4) בלבד, ללא הסברים, בעברית, כדי לדייק את מטרת החבורה. החזר JSON של מערך מחרוזות בלבד."
    : "You help refine a chabura topic. Return a short list (2-4) of concise clarifying questions in English only, with no explanations. Return JSON array of strings only.";

  const user = uiLanguage === "hebrew"
    ? `נושא: "${topic}"\nהחזר רק מערך JSON של שאלות.`
    : `Topic: "${topic}"\nReturn JSON array of questions only.`;

  const resp = await getOpenAITextResponse([
    { role: "system", content: system },
    { role: "user", content: user },
  ], {
    temperature: 0.2,
    maxTokens: 600,
  });

  const arr = tryParseObject(resp.content);
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map((q: any) => String(q)).slice(0, 4);
}

function stripFences(input: string): string {
  return input
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function tryParseObject(text: string): any {
  const raw = stripFences(text);
  try {
    return JSON.parse(raw);
  } catch (_) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = raw.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

function sanitizeCategory(input: string): TorahSource["category"] {
  const v = (input || "").toLowerCase();
  if (v.includes("gemara") || v.includes("talmud")) return "gemara";
  if (v.includes("mishnah")) return "mishnah";
  if (v.includes("torah") || v.includes("chumash")) return "torah";
  if (v.includes("halacha") || v.includes("halakh") || v.includes("shulchan") || v.includes("rambam") || v.includes("poskim")) return "halacha";
  return "other";
}

export async function compileChaburaOutline(topic: string, totalSources: number = 12, extraContext: string = ""): Promise<ChaburaOutline> {
  // Distribute evenly across eras: Talmud, Rishonim, Acharonim, Contemporary
  const base = Math.floor(totalSources / 4);
  const remainder = totalSources % 4;
  const counts = [base, base, base, base];
  for (let i = 0; i < remainder; i++) counts[i] += 1;
  const [talmudCount, rishonimCount, achronimCount, contemporaryCount] = counts;

  const system = `אתה אוסף מקורות הלכתיים תורניים במתכונת שיעור כללי. אינך כותב תשובות, ביאורים או מסקנות. רק מקורות.
מקורות אך ורק ממקורות אורתודוקסיים מוכרים: תלמוד בבלי/ירושלמי, ראשונים, אחרונים, פוסקי זמננו. אין לכלול מקורות שאינם אורתודוקסיים.
ברירת מחדל: חלוקה שווה ככל האפשר לפי תקופות (תלמוד, ראשונים, אחרונים, זמננו). סדר כרונולוגי: תלמוד תחילה, אחריו ראשונים, אחרונים, זמננו; ובתוך כל תקופה – מהקדום לחדש.
יש להחזיר JSON תקין בלבד. כל מקור בעברית מלאה (שם הספר, המחבר, מיקום, הטקסט הקצר) ושדה language תמיד "hebrew". אין טקסט לפני או אחרי ה-JSON.`;

  const user = `נושא החבורה: "${topic}"
${extraContext ? `מידע משלים מהמשתמש: ${extraContext}` : ""}
יש לבנות מתווה שיעור כללי: רק מקורות, בקבוצות (למשל: סוגיות בתלמוד, ראשונים, אחרונים, פוסקים בני זמננו, קושיות ותירוצים – כמקורות בלבד). אין לכתוב הסברים, רק לציין מקורות מדויקים.
יש לכלול בסך הכל ${totalSources} מקורות: תלמוד(${talmudCount}), ראשונים(${rishonimCount}), אחרונים(${achronimCount}), זמננו(${contemporaryCount}).
יש להחזיר מבנה JSON כזה:
{
  "introNoteHebrew": "הערה קצרה בעברית שמסבירה כיצד מתוכנן השיעור הכללי וכיצד להשתמש במקורות (בלי ביאור הלכתי).",
  "sections": [
    {
      "titleHebrew": "כותרת קטע (עברית)",
      "sources": [
        {
          "title": "שם הספר (עברית)",
          "location": "ציון מדויק (עברית)",
          "text": "ציטוט קצר או תמצית בעברית",
          "category": "torah|gemara|mishnah|halacha|other",
          "language": "hebrew"
        }
      ]
    }
  ]
}
החזר JSON בלבד.`;

  const resp = await getOpenAITextResponse([
    { role: "system", content: system },
    { role: "user", content: user },
  ], {
    temperature: 0.2,
    maxTokens: 3500,
  });

  const obj = tryParseObject(resp.content);
  if (!obj || !obj.sections || !Array.isArray(obj.sections)) {
    throw new Error("Chabura outline parsing failed");
  }

  // Sanitize sources and enforce Hebrew
  const sections: ChaburaSection[] = obj.sections.map((sec: any) => ({
    titleHebrew: String(sec.titleHebrew || "קטע"),
    sources: Array.isArray(sec.sources) ? sec.sources.map((s: any) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: String(s.title || "מקור"),
      location: String(s.location || ""),
      text: String(s.text || ""),
      category: sanitizeCategory(String(s.category || "halacha")),
      language: "hebrew" as const,
      timestamp: Date.now(),
    })) : [],
  }));

  const outline: ChaburaOutline = {
    introNoteHebrew: String(obj.introNoteHebrew || "הערה קצרה על אופן בניית החבורה ודרך הניווט בין המקורות."),
    sections,
  };

  // Minimal validation
  const total = outline.sections.reduce((acc, s) => acc + s.sources.length, 0);
  if (total === 0) throw new Error("No sources returned for chabura");

  return outline;
}
