# Using AI PM Assistant

A complete, plain guide to starting the engine and running every skill. If you
read nothing else: open the project in Claude Code and type `/pm` followed by
whatever you have. The orchestrator works out the rest.

---

## Part 1 - Start the engine

### Step 1. Prerequisites
- [Claude Code](https://claude.ai/code) (CLI or VS Code extension)
- An Anthropic account with Claude Code access
- Git

### Step 2. Get the project
```bash
git clone <your-fork-url> ai-pm
cd ai-pm
```

### Step 3. Run it
```bash
claude .
```
Claude automatically reads `CLAUDE.md` and `.claude/CLAUDE.md`, and registers
every slash command in `.claude/commands/`. Nothing else is needed to start
using the text-only skills.

### Step 4. Set up your first client and project
The project keeps each engagement in its own folder using a nested
client to project model. Scaffold one:
```
/new-client ACME PaymentPortal
```
This creates:
```
clients/ACME/
  client.md              shared facts (stakeholders, billing, history)
  PaymentPortal/
    context.md           this engagement (phase, sprint, risks, log)
    project-artefacts/  sprint-artefacts/  meeting-notes/  user-stories/
```
`clients/` is gitignored, so client data never leaves your machine. To add a
second project for the same client, run `/new-client ACME MobileApp`; the
shared `client.md` is reused.

### Step 5. Connect your tools (optional, recommended)
Everything works without connecting anything: skills ask you to paste data and
give you clean markdown back. Connecting tools just removes the copy and paste
and lets skills read live Jira data and publish directly.

**Route A - Claude connectors (simplest).**
The skills are pre-wired to Claude's hosted connectors. In Claude, open
**Settings, then Connectors**, and enable the ones you want:

| Connector | Powers these skills |
|---|---|
| Atlassian (Jira + Confluence) | `/stories`, `/sprint-report`, `/release-checklist`, publishing to Confluence |
| Google Drive | saving artefacts as Docs |
| Notion | publishing pages |
| Gmail | drafting emails (draft only, never auto-send) |

Authenticate each connector through its sign-in prompt. Once enabled, the
skills detect the tools automatically. No config files required.

**Route B - self-hosted MCP servers.**
If you run your own MCP servers instead, copy the template and fill it in:
```bash
cp .mcp.json.example .mcp.json
```
Put real credentials in environment variables (referenced as `${VAR}` in
`.mcp.json`) or a `.env` file. Both are gitignored. For Atlassian, create an
API token at `id.atlassian.com`, then Security, then API tokens. Restart
Claude Code so the servers start.

**Step 6. Verify the connection.**
Run a read-only skill and watch what happens:
```
/sprint-report Sprint 1, project NOTIF, day 5
```
- If Jira is connected, it pulls the live board and writes the report.
- If not, it says Jira is not connected and asks you to paste the board state.
  That is the expected fallback, not an error.

**If you connect nothing:** every skill still runs. Reads become paste-ins,
and saves become a local file or copy-ready markdown. You never lose output.

### Adding any other tool
To wire a tool the skills do not yet call, add its MCP server to `.mcp.json`
(Route B), then add the exact tool name to that skill's `allowed-tools` line in
`skills/<name>/SKILL.md`. Keep scopes minimal: grant a skill only the tools it
needs. After editing any skill, run `bash tests/check-skills.sh` to confirm
nothing broke.

---

## Part 2 - The recommended way to work

`/pm` is the front door. Paste any input and it plans which skills to run, in
what order, asks your approval, then runs them and offers to save each output.

```
/pm Here is a message from our client: "We need real-time payment
notifications before the conference in 6 weeks, budget around 80k."
```

It also reads the active client and project context at the start so it knows
where you left off. Switch context any time with:
```
/pm switching to ACME/MobileApp
```

Use the individual skills below when you already know which one you need.

---

## Part 3 - The 18 skills, step by step

Each skill: what it does, when to use it, how to run it, and what you get back.
Every skill asks where to save before writing anything.

### Intake and framing

**1. `/triage` - structure a raw request**
- When: a stakeholder message, email, or vague ask lands and you need to know what is really being requested.
- Run: `/triage <paste the message>`
- You get: an intake summary (request, business goal, what is clear, missing info, risks, classification, recommended next step).
- Next: `/risk-scan` or `/charter`.

**2. `/risk-scan` - build a risk register**
- When: any phase gate, after a scope change, or when the risk picture is unclear.
- Run: `/risk-scan <project context, phase, known risks>`
- You get: a scored risk register (likelihood, impact, detectability, velocity), top-risk detail, and a verdict.
- Next: runs alongside any other skill.

**3. `/charter` - write a project charter**
- When: formalising a new project and getting sponsor sign-off.
- Run: `/charter <brief or intake summary>`
- You get: a sponsor-ready charter (purpose, objectives, scope, deliverables, stakeholders, timeline, budget, top risks, approvals).
- Next: `/discovery`.

### Discovery and requirements

**4. `/discovery` - plan or summarise a discovery session**
- When: before a workshop (need an agenda and questions) or after one (have raw notes).
- Run: `/discovery <project context, or workshop notes>`
- You get: a facilitation plan, or a structured findings document.
- Next: `/prd`.

**5. `/prd` - write a PRD or BRD**
- When: requirements need documenting before build.
- Run: `/prd <discovery findings, charter, or feature brief>`
- You get: a full requirements doc (goals and metrics, users, functional and non-functional requirements, out of scope, dependencies, open questions, sign-off).
- Next: `/stories`.

**6. `/stories` - break work into epics and stories**
- When: populating a backlog from a PRD.
- Run: `/stories <PRD or feature description, plus Jira project key if creating tickets>`
- You get: epics and Jira-ready user stories with testable acceptance criteria. Creates them in Jira if connected; otherwise gives you markdown to paste.
- Next: `/sprint-sow`.

### Sprint delivery

**7. `/sprint-sow` - write a sprint scope of work**
- When: documenting what a sprint will deliver.
- Run: `/sprint-sow <sprint number, goal, dates, team, ticket list>`
- You get: an SOW (goal, timeline, team, deliverables by theme, out of scope, definition of done).
- Next: `/sprint-planning`.

**8. `/sprint-planning` - plan capacity and backlog**
- When: planning an upcoming sprint with a known team and backlog.
- Run: `/sprint-planning <team availability, sprint length, backlog, goal>`
- You get: a capacity table, P0/P1/P2 backlog, dependencies, risks, definition of done, key dates. Flags overcommitment.
- Next: run the sprint, then `/sprint-report`.

**9. `/sprint-report` - assess sprint health**
- When: mid-sprint or end-of-sprint review.
- Run: `/sprint-report <sprint data or board state, and which day you are on>`
- You get: status (RAG), confidence, forecast, top priorities, risks, actions, standup questions, leadership update.
- Standalone.

**10. `/release-checklist` - go/no-go before shipping**
- When: any production release, hotfix, or phased rollout.
- Run: `/release-checklist <release details or Jira sprint link>`
- You get: a 7-category checklist, blockers list, and one verdict: GO, NO-GO, or CONDITIONAL GO.
- Standalone (often after `/sprint-sow`).

### Governance and communication

**11. `/decision-log` - record a decision or change**
- When: a scope, timeline, budget, or architecture decision needs an audit trail.
- Run: `/decision-log <what was planned, what changed, why, who approved>`
- You get: a structured 11-column decision log entry.
- Standalone (runs after any skill that surfaces a decision).

**12. `/meeting-notes` - clean minutes from a transcript**
- When: turning a Teams, Zoom, or Meet transcript into minutes.
- Run: `/meeting-notes <paste the transcript>`
- You get: summary, decisions, action items with owners and dates, open questions, and follow-up questions to ask.
- Standalone.

**13. `/tech-review` - review an SA or architecture doc**
- When: an SA proposal or integration spec needs translating into delivery risk.
- Run: `/tech-review <paste the technical doc, plus project name and constraints>`
- You get: a plain-English summary, delivery implications, risks, questions for the tech lead, and a feasibility verdict.
- Standalone (or after `/triage`).

**14. `/retrospective` - run or write up a retro**
- When: end of a sprint or phase.
- Run: `/retrospective <sprint name and retro notes, or "plan a retro">`
- You get: a facilitation plan, or a retro summary with owned action items.
- Next: carry actions into the next `/sprint-planning`.

**15. `/stakeholder-update` - write a status update**
- When: weekly or milestone comms to a sponsor, exec, client, or team.
- Run: `/stakeholder-update <status or recent artefacts, plus the audience>`
- You get: an audience-ready update (RAG, progress as outcomes, next, risks, asks). Drafts as email or Confluence if connected.
- Standalone.

### Planning and operations

**16. `/roadmap` - build or update a roadmap**
- When: communicating direction or sequencing a backlog.
- Run: `/roadmap <charter, PRD, backlog, or priority list>`
- You get: a Now/Next/Later or quarterly roadmap with dependencies and honest confidence levels.
- Standalone (often after `/charter` or `/prd`).

**17. `/budget-tracker` - track spend vs budget**
- When: checking budget health or answering "are we on budget?".
- Run: `/budget-tracker <approved budget, spend to date, progress>`
- You get: spent-to-date, forecast at completion, variance, burn rate, and a RAG verdict with actions.
- Standalone (needs a charter budget baseline).

**18. `/onboarding` - brief a new joiner**
- When: someone joins an in-flight project.
- Run: `/onboarding <client/project and the joiner's role>`
- You get: a one-page starter brief from the existing artefacts (what the project is, where it stands, who's who, what to read, decisions made, live risks, first-week checklist).
- Standalone.

---

## Where things get saved

Every skill asks before writing. Defaults live under the active project:
`clients/CLIENT/PROJECT/...`. See the Saving Artefacts and default-paths table
in [.claude/CLAUDE.md](.claude/CLAUDE.md) for the exact path per artefact type,
and the Connection Failsafe rule for what happens when a platform is not
connected.

## Keeping it healthy
After editing any skill or command, run:
```bash
bash tests/check-skills.sh
```
It checks that every skill has the required frontmatter, every command resolves
to a real skill, and every skill has a command wrapper.
