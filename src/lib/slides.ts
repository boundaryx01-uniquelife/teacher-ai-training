import data from "../content/slides-data.json";

export const SLIDE_ORDER: string[] = data.order;
export const SLIDE_TITLES: Record<string, string> = data.titles;
type Practice = Record<string, { module: string; label: string }>;
export const PRACTICE: Practice = data.practice as Practice;
export const MODULE_ROUTE: Record<string, string> = { M1: "/m1", M2: "/m2", M3: "/m3", M4: "/m4", M5: "/m5", M6: "/m6", M7: "/m7", PROMPTS: "/prompts", COPILOT: "/copilot", FINAL: "/final", VIBE: "/vibe", GEMINI: "/gemini", REF: "/ref" };

/** 1-based slide number for a slide id, or null. */
export function slideNumber(id: string): number | null {
  const i = SLIDE_ORDER.indexOf(id);
  return i < 0 ? null : i + 1;
}
export function slideHref(id: string): string | null {
  const n = slideNumber(id);
  return n ? `/slides/#slide-${n}` : null;
}
/** Slide numbers linked to a route (e.g. "/m2" → [11, 12]). */
export function slidesForRoute(route: string): number[] {
  return Object.entries(PRACTICE).filter(([, p]) => MODULE_ROUTE[p.module] === route).map(([id]) => slideNumber(id)!).filter(Boolean).sort((a, b) => a - b);
}
export const SECTIONS: { title: string; start: string }[] = data.sections;
export const TIMERS: Record<string, number> = data.timers;
