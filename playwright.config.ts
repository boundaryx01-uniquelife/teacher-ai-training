import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const PRE = "/opt/pw-browsers/chromium";
const executablePath = process.env.CHROME_PATH || (existsSync(PRE) ? PRE : undefined);
const launchOptions = executablePath ? { executablePath } : {};
export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: { baseURL: process.env.BASE_URL || "http://localhost:8888", trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 }, launchOptions } },
    { name: "iphone", use: { ...devices["iPhone 13"], browserName: "chromium", launchOptions } },
  ],
});
