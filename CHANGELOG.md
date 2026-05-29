# Changelog

All notable changes to AI PM Assistant are recorded here.

---

## [2.0.0] - 2026-05-29

v2.0 moves the project from a single-project text tool toward a
multi-client PM platform. All capabilities below are
**additive**: the original orchestration steps, skill chain order, and output
templates are unchanged. Original authorship remains with Erica, credited in
the README.

### P0: Connectivity and blockers
1. **Connection Failsafe**: canonical rule in `.claude/claude.md` plus inline notes in all 5 MCP skills (`stories`, `sprint-report`, `release-checklist`, `meeting-notes`, `sprint-sow`). When a tool isn't connected, skills tell the user and fall back to text (paste-in for reads; local file or clean markdown for writes) instead of failing or fabricating data.
2. `mcpServers` config template: `.mcp.json.example` (copy to gitignored `.mcp.json`).
3. Documented the credential pattern: `settings.local.json`, `.env`, `.mcp.json`, all gitignored (README plus behaviour file).
4. Setup guide in README: "Connecting Your Tools (MCP)" with connector and self-hosted routes.
5. Tool error handling: canonical "Tool Error Handling" rule plus per-skill failsafe notes.
6. Created `skills/new-client/SKILL.md`.
7. Removed the legacy root `commands/` directory (only `.claude/commands/` is loaded).
8. Added `INSTRUCTIONS.md`: a user walkthrough with start-the-engine steps, step-by-step connector setup (Claude connectors and self-hosted `.mcp.json`), how to add any other tool, and clear instructions for each of the 18 skills.

### P1: Multi-client architecture and persistent context
1. Restructured `/new-client` into the nested client to project model (`/new-client CLIENT PROJECT`).
2. `client.md` (shared, relationship-level) plus `context.md` (per-engagement) templates, embedded in the new-client skill.
3. Supports all three relationships: separate clients, separate projects, and multiple projects under one client.
4. Wired `/pm` to read `client.md` and `context.md` at session start (additive **Step 0**) and confirm the active client/project.
5. Added `/pm switching to CLIENT/PROJECT`.
6. Initialised and scoped the Claude memory layer (`memory/MEMORY.md` plus memory files; documented that it is per-repo and cannot isolate clients, which is the file layer's job).
7. Soft prerequisite gating: makes the orchestrator's existing chain rules explicit (warn and ask once; never a new hard block).

### P2: Hardening and coverage
1. Scoped `Bash(cat:*)` to `Bash(cat:clients/*)`.
2. Hardened `.gitignore` (extra client-folder patterns plus `.mcp.json`).
3. Secrets hygiene rule: never echo tokens into artefacts or chat.
4. New skills: `/retrospective`, `/stakeholder-update`, `/roadmap`, `/budget-tracker`, `/onboarding` (13 to 18 lifecycle skills).
5. Artefact versioning rule: version suffixes, no silent overwrite, link to decision-log.

### P3: Output, testing, orchestration
1. Multi-format output rule: offer `docx`, `pdf`, `pptx` as an extra step after markdown is approved.
2. Testing and eval framework: `tests/check-skills.sh` (structural validator, 120 checks) plus golden cases in `tests/cases/`.
3. Orchestrator plan persistence and resume: optional `context.md` plan block (additive).

### Security: review and hardening
1. Prompt-injection defence: canonical "Untrusted Input & Prompt Injection" rule. Ingested emails, transcripts, and tickets are treated as data not instructions; embedded instructions are ignored and surfaced to the user, and never trigger outbound or destructive actions without explicit confirmation.
2. Input validation and sanitisation rule: client/project names restricted to a safe character set; JQL project keys and sprint names validated and quoted; save paths confined to `clients/`; published output kept as plain markdown with no raw HTML.
3. Path-traversal fix in `/new-client`: names are validated before any `mkdir`, so a name cannot escape the `clients/` directory.
4. JQL-injection notes added inline to `/stories` and `/release-checklist`.
5. External API use rule: respect rate limits and back off on 429; bound bulk writes and confirm large batches; require HTTPS MCP endpoints; keep least-privilege tool scopes (Gmail is draft-only).
6. Verified during review: no hardcoded secrets in tracked files, no client data tracked, no secrets in git history, tool scopes already least-privilege.

---

## [1.0.0] - 2026-05-27

Initial public release. 13 PM skills plus the `/pm` orchestrator, covering the
full delivery lifecycle from raw stakeholder message to production release.
Built from the ground up and migrated to the official Claude plugin layout.
