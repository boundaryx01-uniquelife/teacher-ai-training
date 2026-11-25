import type { Config, Context } from "@netlify/functions";
import { purgeOld } from "../lib/store.ts";

/** Daily retention cleanup (S-5). Runs at 18:00 UTC = 03:00 KST. Deletes rows/sessions older than RETENTION_DAYS (default 30). */
export default async (_req: Request, context: Context) => {
  const deleted = await purgeOld(context);
  console.log(`purge: deleted ${deleted} keys`);
};
export const config: Config = { schedule: "0 18 * * *" };
