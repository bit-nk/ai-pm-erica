---
name: decision-log
description: Creates a structured decision log from project changes, scope revisions, or PM decisions. Use whenever a decision needs to be formally recorded — including when someone says "log this decision", "document this change", "we changed direction on X", or when the PM Orchestrator detects a decision in a prior skill output and asks whether to log it. Also triggers when a user shares a change request, revised scope, or any deviation from the original plan that needs an audit trail.
version: 1.0.0
argument-hint: <decision context, change description, or prior skill output>
allowed-tools: Read
---

## Input

$ARGUMENTS

*If no input is provided above, ask: "Describe the decision or change — what was originally planned, what changed, and why? Include who proposed the change if known."*

---

# What to Extract

From the input, identify every decision or plan change that needs logging. For each one, extract:

- **Area** — Domain of the decision: Scope / Timeline / Budget / Architecture / Team / Process / Other
- **Original Plan** — What was agreed or assumed before this change
- **Revised Plan** — What has been decided instead
- **Reason** — Why the change was made (business driver, risk, constraint, stakeholder request)
- **Change Proposed By** — Role or name of who raised or drove the change
- **Delivery Impact** — Effect on timeline, sprint commitments, or milestones
- **Technical Impact** — Effect on architecture, integrations, or technical approach
- **Product Owner Impact** — Effect on roadmap, backlog, or accepted scope
- **Cost Impact** — Budget effect if known (increase / decrease / neutral / TBC)
- **Change Status** — One of: Proposed / Under Review / Approved / Rejected
- **Change Approved By** — Role or name of approver; use `[TBC]` if not yet confirmed

If a field cannot be determined from the input, write `[TBC]`.

---

# Output Format

## Decision Log

**Project:** [Extract from input, or write "Not specified"]
**Date:** [Today's date]
**Prepared by:** [PM or role if known]

| Area | Original Plan | Revised Plan | Reason | Change Proposed By | Delivery Impact | Technical Impact | Product Owner Impact | Cost Impact | Change Status | Change Approved By |
|---|---|---|---|---|---|---|---|---|---|---|
| [Area] | [What was planned] | [What changed to] | [Why] | [Who] | [Timeline/milestone effect] | [Tech effect] | [PO/roadmap effect] | [Budget effect] | Proposed / Under Review / Approved / Rejected | [Who approved] |

*One row per decision. Add rows as needed.*

---

# After Generating

Ask the user where they want it saved:

> "Where would you like me to save this? I can save it locally or push it directly to any platform you have connected via MCP."
>
> **Local**
> 1. **Local file** — saved to `clients/CLIENT/project-artefacts/YYYY-MM-DD-decision-log.md`
>
> **Connected platforms (via MCP)**
> 2. **Confluence** — published as a new page (I'll ask for your domain, space, and parent page)
> 3. **Google Drive** — saved as a new Doc (I'll ask for the folder)
> 4. **Notion** — created as a new page (I'll ask for your workspace and parent page)
> 5. **Jira** — added as a comment or description on a relevant issue (I'll ask for the issue key)
>
> **No save**
> 6. **Clipboard only** — leave it here for you to copy manually

Do not save or publish anything until the user confirms the destination.
