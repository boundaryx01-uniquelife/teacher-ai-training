// Marks producer=code/brand assets done when their files exist; records actual paths (HANDOFF §4 완료 조건 2).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const path = "assets/manifest.json";
const m = JSON.parse(readFileSync(path, "utf8"));
for (const a of m.assets) {
  if (a.producer === "capture") continue;
  if (a.id === "IMG-14") {
    const official = ["drive", "calendar", "gmail", "canva", "notion", "outlook", "teams", "sharepoint", "github"].every((n) => existsSync(`assets/IMG-14_logos/${n}.svg`));
    a.status = official ? "done" : "fallback";
    a.path = "assets/IMG-14_logos-row.png";
    a.status_note = official ? "official logos composed" : "공식 로고 미수집 — 이름만 쓴 남색 칩 대체본. 사람이 공식 로고를 받아 scripts/compose-logos.mjs 실행";
    continue;
  }
  const p = `assets/${a.file}`;
  if (existsSync(p)) {
    a.status = "done"; a.path = p;
    const extra = [];
    const png2x = p.replace(/\.svg$/, "@2x.png");
    if (p.endsWith(".svg") && existsSync(png2x)) extra.push(png2x);
    if (a.id === "VID-01" && existsSync("assets/VID-01_poster.png")) extra.push("assets/VID-01_poster.png");
    const src = `assets/src/${a.file.replace(/\.png$/, ".svg")}`;
    if (existsSync(src)) extra.push(src);
    if (extra.length) a.extra_files = extra;
  }
}
writeFileSync(path, JSON.stringify(m, null, 2) + "\n");
console.log(m.assets.filter((a) => a.producer !== "capture").map((a) => `${a.id}:${a.status}`).join(" "));
