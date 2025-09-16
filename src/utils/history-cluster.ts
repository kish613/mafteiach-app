import { SearchResult } from "../state/searchStore";
import { getOpenAITextResponse } from "../api/chat-service";

// Legacy export kept for backward compatibility
// Better suggestions: recent unique queries + frequent bigram phrases
export function suggestFromHistory(history: SearchResult[], max: number = 4): string[] {
  const out: string[] = [];
  if (!history?.length) return out;

  const recentUnique: string[] = [];
  const seen = new Set<string>();
  for (const h of [...history].sort((a,b)=>b.timestamp - a.timestamp)) {
    const q = h.query.trim();
    if (!q) continue;
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recentUnique.push(q);
    if (recentUnique.length >= Math.ceil(max/2)) break;
  }
  out.push(...recentUnique);

  const stop = new Set(["the","and","of","a","to","in","on","for","from","with","על","של","את","עם","אל","מן","כי","אם","או","ה"]);
  const bigram: Record<string, number> = {};
  history.forEach(h => {
    const toks = h.query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).filter(t=>!stop.has(t)&&t.length>2);
    for (let i=0; i<toks.length-1; i++) {
      const bi = `${toks[i]} ${toks[i+1]}`;
      bigram[bi] = (bigram[bi]||0)+1;
    }
  });
  const phrases = Object.entries(bigram).sort((a,b)=>b[1]-a[1]).map(([p])=>p).filter(p=>!seen.has(p));
  for (const p of phrases) {
    out.push(p);
    if (out.length >= max) break;
  }

  return out.slice(0, max);
}

// ---------------- Enhanced Similar Topics ----------------

const HEBREW_NIKKUD_REGEX = /[\u0591-\u05C7]/g;
const SPLIT_REGEX = /[^\p{L}\p{N}]+/u;

const STOPWORDS = new Set<string>([
  "the","and","of","a","to","in","on","for","from","with","is","are","as","by","at","or","an","be","this","that",
  "על","של","את","עם","אל","מן","כי","אם","או","ה","מה","לא","כן","בו","בה","אתה","אתם","גם","כל","אין"
]);

const KEYWORDS = new Set<string>([
  // English
  "shabbat","eruv","muktzeh","muktzah","brachot","berachot","tahara","kashrut","sukkah","mincha","tefillin","niddah","shmitta","shemitah","tzedakah","pesach","shavuot","rosh","hashanah","yom","kippur","chametz","eruvin",
  // Hebrew
  "שבת","עירוב","עירובין","מוקצה","ברכות","טהרה","כשרות","סוכה","מנחה","תפילין","נדה","שמיטה","שמיטה","צדקה","פסח","שבועות","ראש","השנה","יום","כיפור","חמץ"
]);

function normalize(text: string): string {
  return text.normalize("NFKC").replace(HEBREW_NIKKUD_REGEX, "").toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(SPLIT_REGEX)
    .filter(Boolean)
    .filter(t => !STOPWORDS.has(t) && t.length > 2);
}

function ngrams(tokens: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

interface Candidate {
  text: string;
  kind: "full" | "phrase";
  count: number;
  lastTs: number;
  hasKeyword: boolean;
  tokens: string[];
}

function buildCandidates(history: SearchResult[], maxItemsPool: number = 12): Candidate[] {
  const recent = history.slice(0, 50); // history already stored most-recent-first
  let minTs = Infinity;
  let maxTs = -Infinity;
  for (const h of recent) {
    minTs = Math.min(minTs, h.timestamp);
    maxTs = Math.max(maxTs, h.timestamp);
  }

  // Full queries grouped
  const fullMap = new Map<string, Candidate>();
  for (const h of recent) {
    const raw = h.query.trim();
    if (!raw) continue;
    const key = normalize(raw);
    const tokens = tokenize(raw);
    const hasKeyword = tokens.some(t => KEYWORDS.has(t));
    const prev = fullMap.get(key);
    if (prev) {
      prev.count += 1;
      prev.lastTs = Math.max(prev.lastTs, h.timestamp);
      prev.hasKeyword = prev.hasKeyword || hasKeyword;
    } else {
      fullMap.set(key, {
        text: raw,
        kind: "full",
        count: 1,
        lastTs: h.timestamp,
        hasKeyword,
        tokens,
      });
    }
  }

  // Phrases (bi/tri-grams) across queries
  const phraseMap = new Map<string, Candidate>();
  for (const h of recent) {
    const toks = tokenize(h.query);
    const bi = ngrams(toks, 2);
    const tri = ngrams(toks, 3);
    const ph = [...bi, ...tri];
    for (const p of ph) {
      const pToks = p.split(" ");
      const hasKw = pToks.some(t => KEYWORDS.has(t));
      if (!hasKw) continue; // only keep phrases near keywords
      const key = p;
      const prev = phraseMap.get(key);
      if (prev) {
        prev.count += 1;
        prev.lastTs = Math.max(prev.lastTs, h.timestamp);
      } else {
        phraseMap.set(key, {
          text: p,
          kind: "phrase",
          count: 1,
          lastTs: h.timestamp,
          hasKeyword: hasKw,
          tokens: pToks,
        });
      }
    }
  }

  // Keep phrases that occur at least twice
  const phraseList = [...phraseMap.values()].filter(p => p.count >= 2);
  const fullList = [...fullMap.values()];

  // Score: recency + frequency + keyword + kind tweak
  const maxFreqFull = Math.max(1, ...fullList.map(c => c.count));
  const maxFreqPhrase = Math.max(1, ...phraseList.map(c => c.count));

  function score(c: Candidate): number {
    const rec = (c.lastTs - minTs) / Math.max(1, (maxTs - minTs));
    const freq = c.kind === "full" ? c.count / maxFreqFull : c.count / maxFreqPhrase;
    const kw = c.hasKeyword ? 0.2 : 0;
    const kindBoost = c.kind === "full" ? 0.1 : 0;
    return rec * 0.5 + freq * 0.4 + kw + kindBoost;
  }

  const pool = [...fullList, ...phraseList]
    .sort((a, b) => score(b) - score(a))
    .slice(0, Math.max(maxItemsPool, 6));

  return pool;
}

function buildUserTheme(history: SearchResult[], k: number = 5): Set<string> {
  const theme = new Set<string>();
  const recent = history.slice(0, k);
  for (const h of recent) {
    const toks = tokenize(h.query);
    for (const t of toks) theme.add(t);
    for (const bi of ngrams(toks, 2)) theme.add(bi);
  }
  return theme;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const v of a) if (b.has(v)) inter += 1;
  const union = a.size + b.size - inter || 1;
  return inter / union;
}

export function suggestSimilarTopics(history: SearchResult[], max: number = 4): string[] {
  if (!history?.length) return [];
  const pool = buildCandidates(history, 12);
  const theme = buildUserTheme(history, 5);

  const scored = pool.map(c => {
    const candSet = new Set<string>([...c.tokens, ...ngrams(c.tokens, 2)]);
    const sim = jaccard(candSet, theme);
    const isAccept = sim >= 0.25 || c.kind === "full"; // allow strong recency full queries
    return { c, sim, accept: isAccept };
  }).filter(x => x.accept);

  const seenNorm = new Set<string>();
  const unique = scored.filter(({ c }) => {
    const key = normalize(c.text);
    if (seenNorm.has(key)) return false;
    seenNorm.add(key);
    return true;
  });

  unique.sort((a, b) => {
    if (b.sim !== a.sim) return b.sim - a.sim;
    // tie-breaker by recency and kind preference
    if (b.c.lastTs !== a.c.lastTs) return b.c.lastTs - a.c.lastTs;
    if (a.c.kind !== b.c.kind) return a.c.kind === "full" ? -1 : 1;
    return 0;
  });

  return unique.map(x => x.c.text).slice(0, max);
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
  });
}

async function reRankWithAI(candidates: string[], recentQueries: string[], max: number): Promise<string[]> {
  if (!candidates.length) return [];
  const prompt = [
    "You are ranking search suggestions for a Torah study app.",
    "Given the user's recent queries, choose the most semantically similar candidates.",
    "Rules:",
    "- Return ONLY a JSON array of up to N strings.",
    "- Each string MUST be exactly one of the candidates provided.",
    "- Do not add explanations.",
    "",
    `N = ${max}`,
    "Recent queries:",
    ...recentQueries.map(q => `- ${q}`),
    "",
    "Candidates:",
    ...candidates.map((c, i) => `${i+1}. ${c}`),
    "",
    "Return JSON only, e.g.: [\"...\",\"...\"]",
  ].join("\n");

  try {
    const res = await withTimeout(getOpenAITextResponse([
      { role: "user", content: prompt },
    ], { temperature: 0, maxTokens: 200 }), 2500);

    const raw = (res.content || "").trim();
    let jsonText = raw;
    if (!jsonText.startsWith("[")) {
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start >= 0 && end > start) jsonText = raw.slice(start, end + 1);
    }
    const arr = JSON.parse(jsonText) as unknown;
    if (Array.isArray(arr)) {
      const allowed = new Set(candidates);
      const filtered = arr.filter(x => typeof x === "string" && allowed.has(x)) as string[];
      const uniq: string[] = [];
      const seen = new Set<string>();
      for (const s of filtered) {
        if (!seen.has(s)) { seen.add(s); uniq.push(s); }
        if (uniq.length >= max) break;
      }
      if (uniq.length) return uniq;
    }
  } catch (_) {
    // fall back silently
  }
  return candidates.slice(0, max);
}

export async function suggestSimilarTopicsAsync(history: SearchResult[], max: number = 4): Promise<string[]> {
  const heuristic = suggestSimilarTopics(history, Math.min(8, Math.max(4, max + 2)));
  const recentQueries = history.slice(0, 5).map(h => h.query);
  if (history.length >= 10 && heuristic.length >= Math.min(3, max)) {
    try {
      const reranked = await reRankWithAI(heuristic, recentQueries, max);
      return reranked.slice(0, max);
    } catch {
      return heuristic.slice(0, max);
    }
  }
  return heuristic.slice(0, max);
}
