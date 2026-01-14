import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");
const exts = new Set([".js", ".jsx", ".ts", ".tsx"]);

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (exts.has(path.extname(full))) files.push(full);
  }
  return files;
}

function extract(content) {
  const results = [];

  // 1) Strings: "..." أو '...' (مبسّط)
  const strRegex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
  const strings = content.match(strRegex) || [];
  for (const s of strings) {
    const cleaned = s.slice(1, -1).trim();
    if (cleaned.length >= 2) results.push(cleaned);
  }

  // 2) JSX text between tags (مبسّط)
  const jsxTextRegex = />\s*([^<>{}][^<]*)\s*</g;
  let m;
  while ((m = jsxTextRegex.exec(content)) !== null) {
    const cleaned = m[1].replace(/\s+/g, " ").trim();
    if (cleaned.length >= 2) results.push(cleaned);
  }

  return results;
}

const files = walk(ROOT);
const all = new Map(); // text -> count

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  for (const t of extract(content)) {
    // فلترة حاجات ماشي UI (اختياري)
    if (/^(http|\/|\.\/|#|@|rgba?\(|\d+)$/.test(t)) continue;
    all.set(t, (all.get(t) || 0) + 1);
  }
}

const sorted = [...all.entries()].sort((a, b) => b[1] - a[1]);
fs.writeFileSync(
  "strings-report.json",
  JSON.stringify(sorted.map(([text, count]) => ({ text, count })), null, 2),
  "utf8"
);

console.log(`✅ Done. Found ${sorted.length} unique strings. Output: strings-report.json`);
