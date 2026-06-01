# Changelog

All notable changes to AI PM Assistant are recorded here.

---

## [3.0.0] - 2026-06-01

v3.0 adds a web dashboard for the AI PM Assistant. It is **additive**: the CLI
skills, the orchestration chain, and the output templates are unchanged. The
dashboard is a client-only React app (no backend) that reproduces the skill
outputs as visual, editable artefacts and ships with seeded demo data so it
runs as a self-contained demo.

### Dashboard application
1. New `dashboard/` app: Vite, React 18, TypeScript, TailwindCSS (HSL theme tokens), Radix/shadcn-style primitives, TanStack Query, Framer Motion, Recharts. Light and dark themes.
2. Three-column workspace: left context rail (client/project, skill nav, connectors, current user), center execution console, right artefact canvas.
3. Nested client to project model in the UI, with inline add for clients and projects. A client/project must be selected before the skill nav appears, and a client with no projects opens the add-project field.

### Orchestrator and skill flow
1. Orchestrator console: paste any input, get a proposed plan across the chain (triage, risk-scan, charter, discovery, PRD, stories, sprint SOW, sprint planning).
2. Decide-then-generate: Approve or Skip each step (reversible), then Complete Orchestration generates the approved sections. Skipped sections are blank and can be generated or added later from the nav.
3. The skill nav unlocks only after a project's first orchestration completes; once complete the plan does not reappear (the console shows a project hub).
4. Structured editing: every artefact is edited through a grouped form, not raw markdown, and the canvas updates live. The displayed artefact and the edit form share one source of truth.

### Artefacts
1. Visual views: risk matrix (likelihood x impact), release checklist with a verdict and multi-select status filter, decision-log grid, sprint plan with a capacity gauge and overcommit flag, sprint report with burndown and velocity, a roadmap timeline (Gantt bars with week gridlines, sprint lanes, and date tooltips), and a budget tracker with a per-developer cost breakdown mapped against the budget.
2. User stories follow the skill guidelines: As a / I want to / So that, story points, status, and testable acceptance criteria per story.
3. Empty or skipped sections render a clean empty state rather than bare headers or zeroed charts.
4. Document artefacts (triage, charter, discovery, PRD, sprint SOW, meeting notes, tech review, retrospective, stakeholder update) render as card sections (labelled field grids, paragraphs, bullet lists, tables, chips, and a status banner) instead of plain markdown.

### Skill parity with the v1.0 specs
Every artefact was extended to carry the fields its CLI skill produces:
1. Risk register: category, detectability, velocity, and response columns alongside likelihood/impact/priority/owner.
2. Charter: purpose, in-scope, deliverables (with due dates), timeline/milestones, budget lines, top risks, and approvals.
3. Discovery: the real problem, success, who is affected, key findings (with confidence), conflicts, how-to-resolve, and recommended next steps.
4. PRD: purpose/background, users and needs, non-functional requirements, out of scope, dependencies, and open questions.
5. Sprint SOW: overview, dates, sprint team, deliverable description/assignee, out of scope, and Definition of Done.
6. Sprint planning: per-person available days and notes, plus backlog owner and dependencies.
7. Sprint report: executive summary, top PM priorities, actions today, and questions for standup.
8. Release checklist: release name, type, target date, and per-item notes.
9. Decision log: the full eleven columns including the delivery, technical, product-owner, and cost impacts.
10. Meeting notes (duration, summary, open questions), tech review (document type, dependencies, scope implications), retrospective (outcome, attendees, impact, owners, sentiment), and stakeholder update (RAG status, coming next, key dates, risk impact and actions).

### Theme and context
1. Current-user chip in the left rail (Erica J., Product Owner).
2. Inline, translucent add fields for clients and projects (no dialogs); the project selector disables and prompts to add the first project when a client has none.
3. Connectors ship with mock API endpoints and tokens pre-filled per tool.

### Multi-record skills and export
1. Multi-record skills (meetings, sprint plans, sprint reports, release checklists, decision logs, tech reviews, retros, stakeholder updates) hold a list of records with editable title and date; open, edit, or add new.
2. Word (.doc) and PDF export for document records, with a title, a linked table of contents, and consistent heading/body fonts.
3. Two seeded scenarios: Finwave (Real-time Notifications) and Acme Corp (Invoice Portal Rebuild, pre-orchestrated), with mock data filled in across artefacts and two records per multi-record skill.

### Connectors and deployment
1. Connectors panel (Jira, Confluence, Drive, Notion, Gmail): connect/disconnect, per-tool HTTPS API endpoint and token with view/hide, and a real connection test. Endpoints are HTTPS-validated; tokens stay in client state. Disconnected tools fall back to paste-in and local/markdown output.
2. Backend seam: the orchestrator is injected via `src/api`; the default is the in-browser mock, with `realOrchestrator` boilerplate selected by `VITE_USE_REAL_API`.
3. GitHub Pages deploy via `.github/workflows/deploy-pages.yml` (build on push to `main`), published at the project sub-path.

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
