/**
 * Reads every skills/<id>/SKILL.md and reference.md from the sibling skills/
 * directory and writes dashboard/src/api/skillPrompts.ts.
 *
 * Run after editing any SKILL.md or reference.md:
 *   node scripts/generateSkillPrompts.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const skillsDir = path.resolve(__dirname, "../../skills");
const outFile = path.resolve(__dirname, "../src/api/skillPrompts.ts");

const prompts = {};

for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillId = entry.name;
  const skillFile = path.join(skillsDir, skillId, "SKILL.md");
  const refFile = path.join(skillsDir, skillId, "reference.md");
  if (!fs.existsSync(skillFile)) continue;

  let skill = fs.readFileSync(skillFile, "utf-8");
  // Strip YAML frontmatter
  skill = skill.replace(/^---[\s\S]*?---\n+/, "");
  // Remove the ## Input / $ARGUMENTS section — user input goes in the Claude user message
  skill = skill.replace(/^## Input\s*\n[\s\S]*?\n---/m, "---");
  // Remove "If no input is provided" hints
  skill = skill.replace(/\*If no input is provided above.*?\*\n?/g, "");
  skill = skill.trim();

  // Append reference.md worked example when present
  if (fs.existsSync(refFile)) {
    const ref = fs.readFileSync(refFile, "utf-8").trim();
    skill = skill + "\n\n---\n\n" + ref;
  }

  prompts[skillId] = skill;
}

const lines = [
  "/**",
  " * Auto-generated — do not edit by hand.",
  " * Run `node scripts/generateSkillPrompts.mjs` to regenerate after editing a SKILL.md.",
  " */",
  "",
  "export const SKILL_PROMPTS: Record<string, string> = {",
];

for (const [id, prompt] of Object.entries(prompts)) {
  lines.push(`  ${JSON.stringify(id)}: ${JSON.stringify(prompt)},`);
  lines.push("");
}

lines.push("};");

fs.writeFileSync(outFile, lines.join("\n"), "utf-8");
console.log(`✓ Generated src/api/skillPrompts.ts (${Object.keys(prompts).length} skills)`);
console.log("  Skills:", Object.keys(prompts).join(", "));
