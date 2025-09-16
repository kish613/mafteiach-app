import { TorahSource } from "../state/searchStore";
import { getOpenAITextResponse } from "../api/chat-service";

export type Era = "gemara" | "mishnah" | "halacha" | "torah" | "other";
export const ERA_ORDER: Era[] = ["gemara", "mishnah", "halacha", "torah", "other"];

export interface GraphNode {
  id: string;
  era: Era;
  title: string;
  label: string; // short display
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "support" | "argue" | "quote";
  confidence: number; // 0..1
}

export interface SugyaGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const SPLIT_REGEX = /[^\p{L}\p{N}]+/u;
const STOP = new Set<string>([
  "the","and","of","a","to","in","on","for","from","with","is","are","as","by","at","or","an","be","this","that",
  "על","של","את","עם","אל","מן","כי","אם","או","ה","מה","לא","כן","בו","בה","גם","כל","אין"
]);

function tokens(s: string): string[] {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .split(SPLIT_REGEX)
    .filter(Boolean)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function shortLabel(src: TorahSource): string {
  const loc = src.location?.trim();
  if (loc && loc.length <= 28) return loc;
  if (loc) return loc.slice(0, 25) + "…";
  const t = src.title?.trim() || "Source";
  return t.length <= 28 ? t : t.slice(0, 25) + "…";
}

export function buildSugyaGraph(sources: TorahSource[]): SugyaGraph {
  const nodes = sources.map<GraphNode>((s) => ({
    id: s.id,
    era: (ERA_ORDER.includes(s.category as Era) ? (s.category as Era) : "other"),
    title: s.title || s.location || "",
    label: shortLabel(s),
  }));

  const byEra: Record<Era, GraphNode[]> = { gemara: [], mishnah: [], halacha: [], torah: [], other: [] };
  nodes.forEach((n) => byEra[n.era].push(n));

  // Sequential edges within each era (left-to-right)
  const edges: GraphEdge[] = [];
  for (const era of ERA_ORDER) {
    const lane = byEra[era];
    for (let i = 0; i < lane.length - 1; i++) {
      edges.push({ from: lane[i].id, to: lane[i + 1].id, type: "quote", confidence: 0.4 });
    }
  }

  // Cross-era edges by shared keywords
  const srcById = new Map(sources.map((s) => [s.id, s] as const));
  const tokById = new Map<string, Set<string>>();
  sources.forEach((s) => {
    const toks = new Set<string>([...tokens(s.title || ""), ...tokens(s.location || ""), ...tokens(s.text || "")]);
    tokById.set(s.id, toks);
  });

  // link from earlier era to later era if overlap >= 3
  const eraIndex = (e: Era) => ERA_ORDER.indexOf(e);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      if (a.id === b.id) continue;
      if (eraIndex(a.era) > eraIndex(b.era)) continue; // only allow forward or within same
      const A = tokById.get(a.id)!;
      const B = tokById.get(b.id)!;
      let inter = 0;
      for (const t of A) if (B.has(t)) inter++;
      if (inter >= 4) {
        // crude polarity: if b.text contains negation near a.title token -> argue
        const text = (srcById.get(b.id)?.text || "").toLowerCase();
        const ttl = (srcById.get(a.id)?.title || "").toLowerCase();
        const neg = /\b(not|however|but|אין|לא|אלא)\b/.test(text);
        edges.push({ from: a.id, to: b.id, type: neg ? "argue" : "support", confidence: 0.55 });
      }
    }
  }

  // De-dup same pairs keep strongest type precedence: argue > support > quote
  const key = (e: GraphEdge) => `${e.from}->${e.to}`;
  const pref = { argue: 3, support: 2, quote: 1 } as const;
  const map = new Map<string, GraphEdge>();
  for (const e of edges) {
    const k = key(e);
    const ex = map.get(k);
    if (!ex || pref[e.type] > pref[ex.type] || (pref[e.type] === pref[ex.type] && e.confidence > ex.confidence)) map.set(k, e);
  }

  return { nodes, edges: [...map.values()] };
}

export async function enhanceEdgesWithAI(nodes: GraphNode[], sources: TorahSource[], edges: GraphEdge[], maxTargets = 20): Promise<GraphEdge[] | null> {
  try {
    const limited = nodes.slice(0, maxTargets);
    const items = limited.map((n) => {
      const s = sources.find((x) => x.id === n.id);
      const snippet = (s?.text || "").slice(0, 400).replace(/\s+/g, " ");
      return { id: n.id, title: s?.title || s?.location || n.label, era: n.era, snippet };
    });
    const prompt = [
      "You are mapping relationships between Torah sources (support, argue, quote).",
      "Given items with id, era, title and snippet, return JSON edges strictly in this format:",
      "{ \"edges\": [ { \"from\": id, \"to\": id, \"type\": \"support|argue|quote\", \"confidence\": 0..1 } ] }",
      "Only use provided ids. Keep edges directional from earlier era to later era when possible.",
      "Items:",
      JSON.stringify(items),
    ].join("\n");

    const res = await getOpenAITextResponse([{ role: "user", content: prompt }], { temperature: 0, maxTokens: 500 });
    const raw = (res.content || "").trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const jsonText = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
    const parsed = JSON.parse(jsonText);
    if (parsed && Array.isArray(parsed.edges)) {
      const out: GraphEdge[] = [];
      for (const e of parsed.edges) {
        if (!e) continue;
        if (!items.find((it) => it.id === e.from)) continue;
        if (!items.find((it) => it.id === e.to)) continue;
        const t = e.type === "argue" || e.type === "support" || e.type === "quote" ? e.type : "quote";
        const c = typeof e.confidence === "number" ? Math.max(0, Math.min(1, e.confidence)) : 0.6;
        out.push({ from: e.from, to: e.to, type: t, confidence: c });
      }
      return out;
    }
  } catch (_) {
    // ignore
  }
  return null;
}
