# AI PM Assistant

A Claude Code project that acts as a senior PM co-pilot. It converts raw inputs - stakeholder messages, meeting transcripts, feature requests - into structured, decision-ready PM artefacts.

## Start Here

**`/pm [paste anything]`** - the recommended entry point. The PM Orchestrator analyses your input, builds a skill plan, and runs the right skills in the right order. You review and approve each step.

Use individual commands only when you know exactly which skill you need.

---

## Commands

### Orchestrator
| Command | What It Does |
|---|---|
| `/pm` | PM Orchestrator - analyses input, plans and chains skills automatically |

### Individual Skills
| Command | What It Does |
|---|---|
| `/triage` | Triage a raw stakeholder message or request |
| `/risk-scan` | Run a risk analysis on a project |
| `/charter` | Write a project charter |
| `/discovery` | Plan or run a discovery workshop |
| `/prd` | Generate a Product Requirements Document |
| `/stories` | Break requirements into epics and user stories |
| `/sprint-report` | Analyse a Jira sprint report |
| `/sprint-sow` | Write a Sprint Scope of Work |
| `/sprint-planning` | Plan a sprint - capacity, backlog scoping, dependencies, and sprint plan doc |
| `/meeting-notes` | Extract minutes from a meeting transcript |
| `/tech-review` | Review an SA proposal or architecture doc for delivery risk |
| `/release-checklist` | Run a go/no-go assessment before a production release |
| `/decision-log` | Record a decision or plan change with full impact assessment |
| `/retrospective` | Facilitate a retro or turn retro notes into owned actions |
| `/stakeholder-update` | Turn status into an audience-ready stakeholder update |
| `/roadmap` | Build or update a Now/Next/Later or quarterly roadmap |
| `/budget-tracker` | Track spend against the charter budget and flag burn-rate risk |
| `/onboarding` | Generate a starter brief to bring a new joiner up to speed |
| `/new-client` | Scaffold a client/project workspace (nested client → project model) |

## Skill Chain

When using individual skills, they run in sequence through the delivery lifecycle:

```
Raw request → /triage → /risk-scan → /charter → /discovery → /prd → /stories → /sprint-sow → /sprint-planning → /release-checklist
                                                                                                            ↕
                                                                                                    /decision-log (after any skill that surfaces a decision)
```

`/pm` handles this chain automatically.

**Standalone skills** (run any time, outside the chain): `/meeting-notes`, `/sprint-report`, `/tech-review`, `/retrospective`, `/stakeholder-update`, `/roadmap`, `/budget-tracker`, `/onboarding`.

## Detailed Instructions

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for full behaviour rules, output defaults, and skill routing logic.

## Client Data

All client work lives in `clients/` locally, using a nested **client → project** model: `clients/CLIENT/client.md` holds shared relationship facts, and each `clients/CLIENT/PROJECT/` holds that engagement's `context.md` and artefacts. Run `/new-client CLIENT PROJECT` to scaffold it. This folder is excluded from version control. Never commit real client names, budgets, or stakeholder details to the public repo.

## Connecting Your Tools (MCP)

Skills can read live Jira data and publish to Confluence, Google Drive, Notion, and Gmail when the matching connector is enabled. If nothing is connected, skills fall back to text automatically (paste data in, get markdown out) - see the **Connection Failsafe** in [.claude/CLAUDE.md](.claude/CLAUDE.md). To connect, copy `.mcp.json.example` to `.mcp.json` and fill it in, or enable the equivalent Claude connectors. Credentials stay in gitignored files - see the README setup section.
