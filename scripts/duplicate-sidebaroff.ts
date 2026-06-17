import {
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, relative, extname } from "path";
import matter from "gray-matter";

const PAIRS: [string, string][] = [
  ["docs/guide", "docs/guide-sidebaroff"],
  ["docs/reference", "docs/reference-sidebaroff"],
  ["docs/blog", "docs/blog-sidebaroff"],
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p).forEach((f) => files.push(f));
    else files.push(p);
  }
  return files;
}

let total = 0;
for (const [SRC, DST] of PAIRS) {
  const files = walk(SRC);
  for (const src of files) {
    if (extname(src) !== ".md") continue;

    const rel = relative(SRC, src);
    const dst = join(DST, rel);

    const raw = readFileSync(src, "utf-8");
    const parsed = matter(raw);
    parsed.data.sidebar = false;
    if (!parsed.data.layout) parsed.data.layout = "doc";

    mkdirSync(join(DST, rel.split("/").slice(0, -1).join("/")), {
      recursive: true,
    });
    writeFileSync(dst, matter.stringify(parsed.content, parsed.data));
    total++;
  }
  console.log(
    `done — ${files.filter((f) => extname(f) === ".md").length} files to ${DST}`,
  );
}

console.log(`total — ${total} files duplicated`);
