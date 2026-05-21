# AI PM Assistant

A Claude Code project that acts as a senior PM co-pilot. It converts raw inputs — stakeholder messages, meeting transcripts, feature requests — into structured, decision-ready PM artefacts.

## Start Here

**`/pm [paste anything]`** — the recommended entry point. The PM Orchestrator analyses your input, builds a skill plan, and runs the right skills in the right order. You review and approve each step.

Use individual commands only when you know exactly which skill you need.

---

## Commands

### Orchestrator
| Command | What It Does |
|---|---|
| `/pm` | PM Orchestrator — analyses input, plans and chains skills automatically |

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
| `/meeting-notes` | Extract minutes from a meeting transcript |
| `/new-client` | Scaffold a new client folder |

## Skill Chain

When using individual skills, they run in sequence through the delivery lifecycle:

```
Raw request → /triage → /risk-scan → /charter → /discovery → /prd → /stories → /sprint-sow
```

`/pm` handles this chain automatically.

## Detailed Instructions

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for full behaviour rules, output defaults, and skill routing logic.

## Client Data

All client work lives in `clients/` locally. This folder is excluded from version control. Never commit real client names, budgets, or stakeholder details to the public repo.
