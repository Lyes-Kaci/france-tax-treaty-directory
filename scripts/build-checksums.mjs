import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "SHA256SUMS.txt");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      if ([".git", "node_modules"].includes(entry.name)) return [];
      return walk(absolute);
    }
    if (!entry.isFile() || relative === "SHA256SUMS.txt") return [];
    return [relative];
  });
}

function sha256(relative) {
  return createHash("sha256")
    .update(readFileSync(path.join(root, relative)))
    .digest("hex");
}

const files = walk(root).sort((a, b) => a.localeCompare(b, "en"));
const manifest = files.map((file) => `${sha256(file)}  ${file}`).join("\n") + "\n";

if (process.argv.includes("--check")) {
  assert.equal(readFileSync(manifestPath, "utf8"), manifest, "SHA256SUMS.txt is stale");
  for (const file of files) assert(statSync(path.join(root, file)).isFile());
  console.log(`Checksums verified: ${files.length} files.`);
} else {
  writeFileSync(manifestPath, manifest, "utf8");
  console.log(`Wrote SHA256SUMS.txt for ${files.length} files.`);
}
