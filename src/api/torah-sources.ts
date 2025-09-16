import { getOpenAITextResponse } from "./chat-service";
import { TorahSource } from "../state/searchStore";
import { Language } from "../state/appStore";

interface SearchTorahSourcesParams {
  query: string;
  numberOfSources: number;
  language: Language;
}

function stripCodeFences(input: string): string {
  return input
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function tryParseJsonArray(text: string): any[] {
  const raw = stripCodeFences(text);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = raw.slice(start, end + 1);
      try {
        const parsed = JSON.parse(slice);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return [];
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

export async function searchTorahSources({
  query,
  numberOfSources,
  language,
}: SearchTorahSourcesParams): Promise<TorahSource[]> {
  try {
    const languageInstruction = getLanguageInstruction(language);

    // Compute target distribution across eras (Talmud, Rishonim, Acharonim, Contemporary)
    const base = Math.floor(numberOfSources / 4);
    const remainder = numberOfSources % 4;
    const counts = [base, base, base, base];
    for (let i = 0; i < remainder; i++) counts[i] += 1;
    const [talmudCount, rishonimCount, achronimCount, contemporaryCount] = counts;
    const distributionText = `Target distribution by era (unless user explicitly requests otherwise): Talmud (Gemara): ${talmudCount}, Rishonim: ${rishonimCount}, Acharonim: ${achronimCount}, Contemporary Orthodox poskim: ${contemporaryCount}.`;

    const systemMessage = `You are an Orthodox Torah source navigator. You MUST ONLY return source citations and references. NEVER provide an answer, explanation, ruling, or guidance.
Use Orthodox canonical sources exclusively: Talmud (Bavli/Yerushalmi), Rishonim (e.g., Rashi, Rambam, Rif, Rosh, Tosafot), Acharonim (e.g., Shulchan Aruch and major commentaries, Mishnah Berurah, Shach, Taz, Aruch HaShulchan), and contemporary Orthodox poskim (e.g., Igrot Moshe, Yabia Omer, Shevet HaLevi, Minchat Shlomo, Tzitz Eliezer). Exclude non-Orthodox or purely academic references.
Default behavior unless the user explicitly requests otherwise:
- Provide an equal or near-equal mix across eras (Talmud, Rishonim, Acharonim, Contemporary) according to the target distribution.
- Order sources chronologically across the entire list: Talmud first, then Rishonim, then Acharonim, then Contemporary; within each era, earlier works first.
Output a valid JSON array only. Each item must include: "title", "location", "text", "category", "language". The "category" should be "gemara" for Talmud sources and "halacha" for Rishonim/Acharonim/Contemporary halachic works (use "torah" or "mishnah" only if explicitly citing those texts). Do not include any prose before or after the JSON.`;

    const userPrompt = `For the question: "${query}"
Provide exactly ${numberOfSources} sources from Orthodox Torah literature.
${distributionText}
Chronological order across the entire list (earliest first, Talmud first).
${languageInstruction}
Return valid JSON only.`;

    const response = await getOpenAITextResponse([
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt }
    ], {
      temperature: 0.2,
      maxTokens: 3000,
    });

    const sourcesData = tryParseJsonArray(response.content);

    const now = Date.now();
    const sources: TorahSource[] = sourcesData.slice(0, numberOfSources).map((source: any, index: number) => ({
      id: `${now}-${index}`,
      title: source.title,
      location: source.location,
      text: source.text,
      category: sanitizeCategory(source.category),
      language: (source.language === "hebrew" || source.language === "english") ? source.language : (language === "hebrew" ? "hebrew" : "english"),
      timestamp: now,
    }));

    // Basic validation: require minimally valid fields
    const valid = sources.filter(s => typeof s.title === "string" && s.title.trim().length > 0 && typeof s.location === "string" && s.location.trim().length > 0);
    if (valid.length === 0) {
      throw new Error("No valid sources returned");
    }

    return valid;
  } catch (error) {
    // Propagate error so UI can show an inline message; do not return mocks
    throw error instanceof Error ? error : new Error("Failed to retrieve Torah sources");
  }
}

function getLanguageInstruction(language: Language): string {
  switch (language) {
    case "hebrew":
      return "Provide all sources and text in Hebrew only. Use Hebrew names for texts and locations.";
    case "english":
      return "Provide all sources and text in English only. Use English transliterations for Hebrew terms.";
    case "both":
      return "Provide sources in both Hebrew and English when possible. Include Hebrew text with English translations.";
    default:
      return "Provide sources in English with Hebrew terms transliterated.";
  }
}

// Note: No mock data is returned in production; failures throw and are handled by UI banners.