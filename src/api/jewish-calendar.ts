export interface DafInfo {
  ref: string; // e.g., "Horayot 9"
  heRef?: string;
  displayEn?: string;
  displayHe?: string;
}

export async function getTodaysDaf(): Promise<DafInfo | null> {
  try {
    const resp = await fetch("https://www.sefaria.org/api/calendars");
    const json = await resp.json();
    const items = json?.calendar_items as any[] | undefined;
    if (!Array.isArray(items)) return null;
    const daf = items.find(it => it?.title?.en === "Daf Yomi");
    if (!daf) return null;
    return {
      ref: typeof daf.ref === "string" ? daf.ref : (typeof daf.displayValue?.en === "string" ? daf.displayValue.en : ""),
      heRef: typeof daf.heRef === "string" ? daf.heRef : undefined,
      displayEn: typeof daf.displayValue?.en === "string" ? daf.displayValue.en : undefined,
      displayHe: typeof daf.displayValue?.he === "string" ? daf.displayValue.he : undefined,
    };
  } catch {
    return null;
  }
}
