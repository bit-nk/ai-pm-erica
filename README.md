# AI PM Assistant

A Claude Code project that gives you a senior PM co-pilot inside your terminal. It ships a library of structured skills — from intake triage through sprint planning — so you can go from raw stakeholder messages to sprint-ready artefacts without switching tools.

## What It Does

Each skill is a focused PM workflow. Claude reads the relevant skill file, follows the defined process, and produces a structured output you can paste directly into Confluence, Jira, or a client doc.

| Skill | What It Produces |
|---|---|
| `intake-triage` | Structured intake summary from raw stakeholder requests |
| `risk-scan` | Risk register with scoring, owners, and trigger signals |
| `project-charter` | Sponsor-ready project charter |
| `discovery-workshop` | Discovery workshop guide and output structure |
| `prd` | Product Requirements Document |
| `user-stories` | Jira-ready epics and user stories with acceptance criteria |
| `sprint-report` | Sprint report analysis from Jira data |
| `sprint-sow` | Sprint Scope of Work document |
| `meeting-note` | Clean meeting minutes from raw transcripts |
| `technical-feasibility-review` | PM-ready review of SA proposals and architecture docs — delivery risks and questions for the tech lead |

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

Claude will automatically read `.claude/CLAUDE.md` and the skills in `.claude/skills/` and be ready to use them.

## How to Use

Type a slash command to run a specific skill:

```
/triage
/charter
/prd
/stories
/sprint-sow
```

Or use the PM Orchestrator to let Claude choose the right skill automatically:

```
/pm Here's a message from my client — [paste anything]
```

Or just describe your task in plain English and Claude will route it:

```
Here's a message from my client — can you run intake triage on this?
```

Skills chain naturally. After intake triage, ask for a risk scan. After a charter, ask for user stories.

## Project Structure

```
.claude/
  CLAUDE.md                     # Project-level Claude instructions
  commands/                     # Slash command entry points
    pm.md                       # PM Orchestrator (/pm)
    triage.md                   # /triage
    risk-scan.md                # /risk-scan
    charter.md                  # /charter
    discovery.md                # /discovery
    prd.md                      # /prd
    stories.md                  # /stories
    sprint-report.md            # /sprint-report
    sprint-sow.md               # /sprint-sow
    meeting-notes.md            # /meeting-notes
    new-client.md               # /new-client
    tech-review.md              # /tech-review
  skills/
    pm-execution/               # Delivery lifecycle skills
      intake-triage/
        skill.md                # Skill definition and workflow
        reference.md            # Worked example
      risk-scan/
        skill.md
        reference.md
        phase-guide.md          # Phase-specific risk patterns
      project-charter/
        skill.md
        reference.md
      discovery-workshop/
        skill.md
        reference.md
      prd/
        skill.md
        reference.md
        brd-guide.md            # BRD output variant
      user-stories/
        skill.md
        reference.md
        references/
          story-template.md
          ac-format.md
      sprint-report/
        skill.md
        reference.md
      sprint-sow/
        skill.md
        reference.md
      meeting-note/
        skill.md
        reference.md
      technical-feasibility-review/
        skill.md
        reference.md
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
