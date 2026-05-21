# AI PM Assistant

A Claude Code project that acts as a senior PM co-pilot. It converts raw inputs — stakeholder messages, meeting transcripts, feature requests — into structured, decision-ready PM artefacts.

## Quick Reference

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

Skills are designed to run in sequence through a delivery lifecycle:

```
Raw request → /triage → /risk-scan → /charter → /discovery → /prd → /stories → /sprint-sow
```

## Detailed Instructions

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for full behaviour rules, output defaults, and skill routing logic.

## Client Data

All client work lives in `clients/` locally. This folder is excluded from version control. Never commit real client names, budgets, or stakeholder details to the public repo.
