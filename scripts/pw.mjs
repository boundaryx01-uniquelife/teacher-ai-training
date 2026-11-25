// Shared Playwright launcher: the container's preinstalled Chromium (project pins a newer @playwright/test).
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
const PRE = "/opt/pw-browsers/chromium";
export const CHROME = process.env.CHROME_PATH || (existsSync(PRE) ? PRE : undefined);
export const launch = (opts = {}) => chromium.launch({ ...(CHROME ? { executablePath: CHROME } : {}), ...opts });
