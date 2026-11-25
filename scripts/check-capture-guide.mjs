// Compares manifest capture entries with assets/_capture-guide.md tables (id, size, filename) — HANDOFF S-13.
import { readFileSync } from "node:fs";
const m = JSON.parse(readFileSync("assets/manifest.json", "utf8"));
const guide = readFileSync("assets/_capture-guide.md", "utf8");
const rows = new Map();
for (const line of guide.split("\n")) {
  const c = line.split("|").map((s) => s.trim());
  if (c.length > 6 && /^(IMG|VID)-\d+[a-z]?$/.test(c[1])) rows.set(c[1], { size: c[4], file: c[5] });
}
let ok = 0, bad = [];
const cap = m.assets.filter((a) => a.producer === "capture");
for (const a of cap) {
  const r = rows.get(a.id);
  const size = `${a.size_px[0]}×${a.size_px[1]}`;
  if (!r) bad.push(`${a.id}: missing in guide`);
  else if (r.size !== size || r.file !== a.file) bad.push(`${a.id}: guide ${r.size} ${r.file} ≠ manifest ${size} ${a.file}`);
  else ok++;
}
for (const id of rows.keys()) if (!cap.find((a) => a.id === id)) bad.push(`${id}: in guide but not a capture item in manifest`);
console.log(`capture items: ${cap.length}, guide rows: ${rows.size}, matched: ${ok}`);
console.log(bad.length ? "MISMATCH:\n" + bad.join("\n") : "100% match");
process.exit(bad.length ? 1 : 0);
