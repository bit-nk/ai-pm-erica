# AI PM Assistant Dashboard

A web dashboard for the AI PM Assistant. It turns messy inputs (a stakeholder
message, a transcript, a brief) into structured, decision-ready PM artefacts and
lets you review, edit, and export them. It runs fully in the browser against a
built-in mock, so it works as a self-contained demo with no backend.

Live demo: published to GitHub Pages from `main` (see Deployment below).

---

## What it does

- **Orchestrator console.** Paste anything and the orchestrator proposes a plan
  (triage, risk scan, charter, discovery, PRD, stories, sprint SOW, sprint
  planning). You **Approve** or **Skip** each step, then **Complete
  Orchestration** to generate the approved sections. Skipped sections stay
  blank and can be generated or added later.
- **Structured editing.** Every artefact is edited through a form, not raw
  markdown. Fields are grouped into clear sections, and the artefact on the
  right updates live as you type.
- **Visual artefacts.** Risk matrix, release checklist with a verdict, decision
  log grid, sprint plan capacity gauge, sprint report burndown, a roadmap
  timeline (Gantt-style bars with week gridlines and date tooltips), and a
  budget tracker with a per-developer cost breakdown.
- **Multi-record skills.** Meetings, sprint plans, sprint reports, release
  checklists, decision logs, tech reviews, retros, and stakeholder updates each
  hold a list of records you can add, open, edit, and (for document types)
  export.
- **Export.** Document artefacts export to **Word (.doc)** and **PDF** with a
  title, a linked table of contents, and consistent heading/body fonts.
- **Connectors.** Connect MCP tools (Jira, Confluence, Drive, Notion, Gmail),
  add a per-tool HTTPS API endpoint and token (with view/hide), and test the
  connection. Disconnected tools fall back to paste-in and local/markdown
  output.
- **Light / dark theme**, per-client/project context, and a current-user chip.

## Seeded mock data

Two worked scenarios ship pre-filled so you can explore immediately:

- **Finwave / Real-time Notifications** - run the orchestrator to unlock it, then
  browse and edit every artefact.
- **Acme Corp / Invoice Portal Rebuild** - already orchestrated, so its skill
  nav is unlocked out of the box with content in every section.

Multi-record skills come seeded with two records each (e.g. Sprint 1 and Sprint
2 plans, two meetings, two release checklists).

## How to use it

1. Pick a **Client**, then a **Project** in the left rail. (New client/project
   are inline fields, no dialogs.)
2. If the project is not yet set up, the center shows the **orchestrator**.
   Paste a brief and **Run orchestrator**.
3. Review the plan: toggle **Approve / Skip** per step, then **Complete
   Orchestration**. The skill nav unlocks on the left.
4. Click a skill to view its artefact on the right. Use **Edit** to change it in
   the structured form, or **Generate Plan** on a skipped section to draft it.
5. For multi-record skills, the center shows a list: **Open**, **Edit**, add a
   **New** one, or **Word / PDF** export each record.

## Run locally

```bash
cd dashboard
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
npm test         # unit tests (vitest)
```

## Architecture

- **Vite + React 18 + TypeScript**, TailwindCSS (HSL CSS-variable theme tokens),
  Radix/shadcn-style UI primitives, TanStack Query, Framer Motion, Recharts.
- **State** lives in `src/store/workspace.tsx` (clients, projects, artefact
  values, records, orchestration status). Artefacts are built from structured
  inputs in `src/components/onboarding/buildArtifact.ts`, so the canvas view and
  the edit form always share one source of truth.
- **Data contracts** are in `src/types/pm.ts` (a discriminated union of typed
  artefact payloads).
- **Backend seam.** The orchestrator is injected via `src/api`. The default is
  the in-browser `mockOrchestrator`; `realOrchestrator.ts` is boilerplate for a
  real backend and is selected with `VITE_USE_REAL_API`.

> Note: this is a client-only demo. Connector tokens live in browser state and
> direct third-party calls are limited by CORS. Real, secure integrations need a
> server-side proxy that holds the secrets.

## Deployment (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds `dashboard/` and publishes it to
GitHub Pages on every push to `main`. The build sets the base path to the
project sub-path (`/ai-pm-erica/`). Enable Pages once in the repo under
**Settings, Pages, Source: GitHub Actions** (the workflow also attempts to
enable it automatically).
