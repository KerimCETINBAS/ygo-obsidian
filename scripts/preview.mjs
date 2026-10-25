import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vault = path.resolve(process.argv[2] ?? "G:/viteria/Yugioh");
const pluginId = "ygo-combo-builder";
const pluginDir = path.join(vault, ".obsidian", "plugins", pluginId);

const build = spawnSync(process.execPath, ["node_modules/typescript/lib/tsc.js", "--noEmit", "--pretty", "false"], {
  cwd: root,
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const bundle = spawnSync(process.execPath, ["esbuild.config.mjs", "production"], {
  cwd: root,
  stdio: "inherit",
});
if (bundle.status !== 0) process.exit(bundle.status ?? 1);

mkdirSync(pluginDir, { recursive: true });
for (const file of ["main.js", "manifest.json", "styles.css"]) {
  copyFileSync(path.join(root, "dist", file), path.join(pluginDir, file));
}

const enabledPath = path.join(vault, ".obsidian", "community-plugins.json");
const enabled = existsSync(enabledPath) ? JSON.parse(readFileSync(enabledPath, "utf8")) : [];
if (!enabled.includes(pluginId)) {
  enabled.push(pluginId);
  writeFileSync(enabledPath, `${JSON.stringify(enabled, null, 2)}\n`);
}

mkdirSync(path.join(vault, "cards"), { recursive: true });

const notePath = path.join(vault, "YGO", "Preview.md");
if (!existsSync(notePath)) {
  const combo = readExport(path.join(root, "src", "sample.ts"), "SAMPLE_SOURCE").trimEnd();
  writeFileSync(notePath, `# Preview\n\n\`\`\`ygo-combo\n${combo}\n\`\`\`\n`);
}

const deckPath = path.join(vault, "YGO", "Deck.md");
if (!existsSync(deckPath)) {
  const deck = readExport(path.join(root, "src", "sample.ts"), "DECK_SOURCE").trimEnd();
  writeFileSync(
    deckPath,
    `# Deck\n\n\`\`\`ygo-deck\n${deck}\n\`\`\`\n\nIn the note, [[Sunseed Genius Loci]] is text and ![[Sunavalon Dryas.png]] is the picture.\n`,
  );
}

console.log(`Copied: ${pluginDir}`);
console.log("Reload the plugin once in Obsidian.");

function readExport(file, name) {
  const text = readFileSync(file, "utf8");
  const marker = `export const ${name} = \``;
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`${name} was not found: ${file}`);
  let index = start + marker.length;
  let body = "";
  while (index < text.length) {
    const char = text[index];
    if (char === "\\") {
      body += text[index + 1] === "n" ? "\n" : text[index + 1] === "t" ? "\t" : text[index + 1];
      index += 2;
      continue;
    }
    if (char === "`") return body;
    body += char;
    index += 1;
  }
  throw new Error(`${name} is not closed: ${file}`);
}
