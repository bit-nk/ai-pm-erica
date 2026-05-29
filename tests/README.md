# Tests

These skills are prompts, not code - so "testing" means checking two things:

1. **Structure (automated).** Every skill honours the same contract: required
   frontmatter, a command wrapper, and a wrapper that resolves to a real skill
   file. Run:

   ```bash
   bash tests/check-skills.sh
   ```

   Exit code 0 = all good. Run this after editing any skill or command.

2. **Output quality (golden cases).** For the skills where output shape matters
   most, `cases/` holds a sample input and the sections the output **must**
   contain. These are a manual/eval reference - paste the input into the skill
   and confirm every "must contain" section is present and populated. They give
   you a baseline so a template edit doesn't silently drop a section.

## Adding a case

Create `cases/<skill>.md` with two parts: a fenced **Input** block and a
**Must contain** checklist of required output sections. Keep inputs short and
self-contained. See `cases/triage.md` for the pattern.

## Why no full automated eval harness?

Running skills end-to-end requires a live model and (for some) MCP connections.
The structural check catches the most common breakage (missing fields, broken
command→skill links) with zero dependencies; the golden cases catch output
regressions by eye. The `skill-creator` skill can run richer evals if needed.
