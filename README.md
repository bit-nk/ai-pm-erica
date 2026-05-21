# AI PM Assistant

A Claude Code project that gives you a senior PM co-pilot inside your terminal. It ships a library of nine structured skills — from intake triage through sprint planning — so you can go from raw stakeholder messages to sprint-ready artefacts without switching tools.

## What It Does

Each skill is a focused PM workflow. Claude reads the relevant skill file, follows the defined process, and produces a structured output you can paste directly into Confluence, Jira, or a client doc.

| Skill | What It Produces |
|---|---|
| `01-intake-triage` | Structured intake summary from raw stakeholder requests |
| `02-initial-risk-scan` | Risk register with scoring, owners, and trigger signals |
| `03-project-charter` | Sponsor-ready project charter |
| `04-discovery-workshop` | Discovery workshop guide and output structure |
| `05-prd-generator` | Product Requirements Document |
| `06-user-stories` | Jira-ready epics and user stories with acceptance criteria |
| `07-jira-sprint-report-analyst` | Sprint report analysis from Jira data |
| `08-sprint-sow` | Sprint Scope of Work document |
| `09-meeting-note` | Clean meeting minutes from raw transcripts |

## Requirements

- [Claude Code](https://claude.ai/code) (CLI or VS Code extension)
- An Anthropic account with Claude Code access

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-pm-assistant.git
cd ai-pm-assistant
```

Open the folder in Claude Code:

```bash
claude .
```

Claude will automatically read `.claude/claude.md` and the skills in `.claude/skills/` and be ready to use them.

## How to Use

Type a skill name or describe your task in plain English:

```
/01-intake-triage
```

Or paste raw input and ask Claude to triage it:

```
Here's a message from my client — can you run intake triage on this?
```

Skills chain naturally. After intake triage, ask for a risk scan. After a charter, ask for user stories.

## Project Structure

```
.claude/
  claude.md               # Project-level Claude instructions
  skills/
    01-intake-triage/
      skill.md            # Skill definition and workflow
      reference.md        # Worked example
    02-initial-risk-scan/
      skill.md
      reference.md
      phase-guide.md      # Phase-specific risk patterns
    ...
```

## Client Data

The `clients/` directory (excluded from this repo via `.gitignore`) is where project artefacts for specific clients are stored locally. Never commit real client files to a public repository.

To use the skills for your own clients, create your own `clients/YOUR_CLIENT/` folder locally after cloning.

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b skill/your-skill-name`
3. Follow the existing skill structure (`skill.md` + `reference.md` minimum)
4. Open a pull request

## Skill Authoring Guide

Each skill needs at minimum:

- **Frontmatter** — `name`, `description`, `tools`
- **Purpose** — one paragraph on what this skill does and when to use it
- **When to Use / Do Not Use** — clear routing boundaries
- **Operating Principles** — numbered, concise
- **Required Workflow** — numbered steps in order
- **Output Format** — exact template Claude follows
- **Style Rules** — tone and format guardrails
- **Reference file** — a worked example input → output

See any existing skill for the pattern.

## License

MIT
