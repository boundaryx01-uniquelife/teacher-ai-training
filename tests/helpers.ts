import { readFileSync, existsSync } from "node:fs";
import type { Page } from "@playwright/test";
export function pin(): string {
  if (process.env.TRAINER_PIN) return process.env.TRAINER_PIN;
  if (existsSync(".env")) { const m = readFileSync(".env", "utf8").match(/^TRAINER_PIN=(.*)$/m); if (m) return m[1].trim(); }
  throw new Error("TRAINER_PIN not available for tests");
}
export function trackConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
