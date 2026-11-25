// Converts <text> elements in an SVG into <path> outlines using opentype.js.
// Usage: node scripts/text2path.mjs in.svg out.svg
// Supported <text> attrs: x, y (baseline), font-size, font-weight (>=600 => bold), font-family (contains "mono" => JetBrains Mono),
// text-anchor (start|middle|end), fill, letter-spacing. Content must be plain text (no tspans).
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const roots = [resolve(here, ".."), "/home/user/pkg"];
const root = roots.find((r) => existsSync(r + "/node_modules/opentype.js")) ?? roots[1];
const require = createRequire(root + "/package.json");
const opentype = require("opentype.js");
const fontDir = [resolve(here, "../assets/fonts"), "/home/user/pkg/assets/fonts"].find((d) => existsSync(d + "/NotoSansKR-400.ttf"));
const cache = {};
const font = (f) => {
  if (!cache[f]) {
    const b = readFileSync(`${fontDir}/${f}.ttf`);
    cache[f] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  }
  return cache[f];
};

export function textToPath({ text, x = 0, y = 0, size = 16, weight = 400, mono = false, anchor = "start", spacing = 0 }) {
  const f = font(mono ? "JetBrainsMono-400" : weight >= 600 ? "NotoSansKR-700" : "NotoSansKR-400");
  const opts = { kerning: false, letterSpacing: spacing / size };
  const adv = f.getAdvanceWidth(text, size, opts);
  const cx = anchor === "middle" ? x - adv / 2 : anchor === "end" ? x - adv : x;
  // opentype.js toPathData can emit NaN for some float offsets; build at origin and translate instead.
  return { d: f.getPath(text, 0, 0, size, opts).toPathData({ decimalPlaces: 2, flipY: false }), cx, y };
}

export function convert(svg) {
  return svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (_, attrs, content) => {
    const a = (n, def) => (attrs.match(new RegExp(`(?:^|\\s)${n}="([^"]*)"`)) || [, def])[1];
    const text = content.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    const { d, cx, y } = textToPath({
      text, x: +a("x", 0), y: +a("y", 0), size: +a("font-size", 16), weight: +a("font-weight", 400),
      mono: /mono/i.test(a("font-family", "")), anchor: a("text-anchor", "start"), spacing: +a("letter-spacing", 0),
    });
    return `<path fill="${a("fill", "#14213D")}" stroke="none" transform="translate(${cx.toFixed(2)} ${y})" d="${d}"/>`;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [inp, out] = process.argv.slice(2);
  if (!inp || !out) { console.error("usage: text2path in.svg out.svg"); process.exit(1); }
  writeFileSync(out, convert(readFileSync(inp, "utf8")));
  console.log(`wrote ${out}`);
}
