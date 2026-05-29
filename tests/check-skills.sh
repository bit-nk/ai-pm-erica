#!/usr/bin/env bash
#
# check-skills.sh - structural smoke test for the skill library.
# No runtime to test, so we validate the contract every skill must honour:
#   1. Each skills/<name>/SKILL.md has the required frontmatter fields.
#   2. Each /command wrapper points at a skill file that exists.
#   3. No skill is missing a command wrapper (and vice versa).
#
# Usage:  bash tests/check-skills.sh
# Exit:   0 = all checks pass, 1 = at least one failure.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

fail=0
pass=0
note() { printf '  %s\n' "$1"; }
ok()   { pass=$((pass+1)); }
err()  { fail=$((fail+1)); printf 'FAIL: %s\n' "$1"; }

REQUIRED_FIELDS=(name description version allowed-tools)

echo "== 1. Skill frontmatter =="
for skill in skills/*/SKILL.md; do
  [ -e "$skill" ] || continue
  header=$(awk 'NR==1{next} /^---/{exit} {print}' "$skill")
  for field in "${REQUIRED_FIELDS[@]}"; do
    if printf '%s\n' "$header" | grep -q "^${field}:"; then ok; else
      err "$skill is missing frontmatter field: $field"
    fi
  done
done
note "checked $(ls -d skills/*/ 2>/dev/null | wc -l | tr -d ' ') skills"

echo "== 2. Command wrappers resolve to a skill =="
for cmd in .claude/commands/*.md; do
  [ -e "$cmd" ] || continue
  base=$(basename "$cmd" .md)
  # The wrapper should reference a skills/<name>/SKILL.md path.
  if grep -q "skills/.*/SKILL.md" "$cmd"; then
    target=$(grep -o "skills/[^ \`]*/SKILL.md" "$cmd" | head -1)
    if [ -f "$target" ]; then ok; else err "$cmd points at missing skill: $target"; fi
  else
    err "$cmd does not reference any skills/<name>/SKILL.md"
  fi
done

echo "== 3. Every skill has a command wrapper =="
for skill in skills/*/; do
  name=$(basename "$skill")
  if [ -f ".claude/commands/${name}.md" ]; then ok; else
    err "skill '$name' has no .claude/commands/${name}.md wrapper"
  fi
done

echo
if [ "$fail" -eq 0 ]; then
  echo "PASS - $pass checks passed, 0 failures."
  exit 0
else
  echo "FAILED - $pass checks passed, $fail failures."
  exit 1
fi
