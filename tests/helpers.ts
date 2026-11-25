import { readFileSync, existsSync } from "node:fs";
import type { Page } from "@playwright/test";
export function pin(): string {
  if (process.env.TRAINER_PIN) return process.env.TRAINER_PIN;
  if (existsSync(".env")) { const m = readFileSync(".env", "utf8").match(/^TRAINER_PIN=(.*)$/m); if (m) return m[1].trim(); }
  throw new Error("TRAINER_PIN not available for tests");
}
export function trackConsole(page: Page): string[] {
  const errors: string[] = [];
  // Netlify injects a review drawer only on Deploy Preview URLs: a div with style="position:fixed"
  // (CSP hash sha256-dH+oOZOdDv+MWU0F8bCZOoFHX0jFM4+bwNqOKujbv90=) and an app.netlify.com frame. Not our code; absent in production.
  const netlifyPreviewNoise = (t: string) => t.includes("sha256-dH+oOZOdDv+MWU0F8bCZOoFHX0jFM4+bwNqOKujbv90=") || t.includes("Framing 'https://app.netlify.com/'");
  page.on("console", (m) => { if (m.type() === "error" && !netlifyPreviewNoise(m.text())) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
