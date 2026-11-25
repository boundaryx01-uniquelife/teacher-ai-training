// Marks producer=code/brand assets done when their files exist; records actual paths (HANDOFF §4 완료 조건 2).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const path = "assets/manifest.json";
const m = JSON.parse(readFileSync(path, "utf8"));
for (const a of m.assets) {
  if (a.producer === "capture") {
    // done once scripts/postprocess.mjs has produced the sized file from assets/_raw/
    const p = `assets/${a.file}`;
    if (existsSync(p)) { a.status = "done"; a.path = p; if (a.id === "IMG-04") a.status_note = "공개 페이지라 Code가 직접 캡처(포털 + 실제 JSON, 부경고 2026-11-25)"; }
    continue;
  }
  if (a.id === "IMG-14") {
    const names = ["drive", "calendar", "gmail", "canva", "notion", "outlook", "teams", "sharepoint", "github"];
    const have = names.filter((n) => existsSync(`assets/IMG-14_logos/${n}.svg`));
    const official = have.length === names.length;
    a.status = official ? "done" : have.length ? "partial" : "fallback";
    a.path = "assets/IMG-14_logos-row.png";
    const miss = names.filter((n) => !have.includes(n));
    a.status_note = official ? "official logos composed" : `공식 로고 ${have.length}/9. 없는 것(${miss.join(", ")})은 이름 칩. 사람이 공식 파일을 받아 assets/IMG-14_logos/에 넣고 scripts/compose-logos.mjs 실행`;
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
