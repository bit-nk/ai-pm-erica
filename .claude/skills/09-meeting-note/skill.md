---
name: 09-meeting-note
description: >
  Use this skill whenever the user wants to extract meeting notes, minutes, or a summary from a meeting transcript — especially from Microsoft Teams, Zoom, Google Meet, or any raw transcript text. Trigger when the user shares a transcript file or text and asks for a summary, key points, action items, decisions, or meeting minutes. Also trigger when the user says things like "summarize this meeting", "what was discussed", "extract the important parts", "write up the minutes", or pastes a block of conversation text that looks like a meeting transcript. This skill produces clean, plain-English meeting minutes and follow-up questions the user can ask to go deeper. Also trigger when the user wants to save or publish meeting minutes to Confluence.
---

# Meeting Minutes Skill

Turn raw meeting transcripts into clean, useful meeting minutes. Remove filler, repetition, and side-chatter. Keep only what matters. Optionally save to Confluence.

---

## Confluence configuration

- **Cloud ID:** `intelligentlending.atlassian.net`
- **Space:** `Binq`
- **Meeting Minutes folder page ID:** `1510965252`
- **Tag to add for AI-generated/updated pages:** `AI`

---

## What to do

### Step 1 — Read the transcript

The transcript may arrive as:
- A pasted block of text in the chat
- An uploaded `.txt`, `.vtt`, `.docx`, or `.pdf` file (read it using the file-reading skill if needed)
- A Teams auto-generated transcript (look for speaker labels like `John Smith   00:01:23`)

Strip out:
- Filler words ("um", "you know", "like", "so yeah")
- Repetition (same point made multiple times — keep the clearest version)
- Off-topic chatter (weather talk, lunch plans, "can everyone hear me?")
- Crosstalk and false starts

---

### Step 2 — Write the meeting minutes

Output in this exact structure. Use plain English. Be concise. No bullet should be more than 2 lines.

---

**MEETING MINUTES**

**Date:** [extract from transcript, or write "Not specified"]
**Attendees:** [list names mentioned or identified as speakers]
**Duration:** [if determinable from timestamps]

---

**Summary**
2–4 sentences. What was this meeting about and what was the overall outcome?

---

**Key Discussion Points**
List the main topics discussed. For each topic:
- **Topic name** — What was said. What was decided or concluded (if anything).

Keep to 3–8 points. Combine related sub-discussions under one topic.

---

**Decisions Made**
Bullet list of firm decisions reached during the meeting. If none, write "No formal decisions recorded."

---

**Action Items**
| Who | What | By When |
|-----|------|---------|
| Name | Task description | Date or "TBD" |

If no action items were clear, write "No action items identified."

---

**Open Questions**
Things raised but not resolved. Keep it short — 2–5 items max.

---

### Step 3 — Ask follow-up questions

After the minutes, add a short section:

---

**Want to dig deeper? Here are some things you could ask:**
- [Question based on an unresolved issue in the transcript]
- [Question about a decision that seemed unclear]
- [Question about a person's role or responsibility mentioned]
- [Question about next steps or timeline]

Generate 3–5 relevant questions. Make them specific to THIS meeting, not generic.

---

### Step 4 — Check Confluence for an existing page

Before saving anything, always check whether a meeting minutes page already exists for the same date.

1. Call `getConfluencePageDescendants` with:
   - `cloudId`: `intelligentlending.atlassian.net`
   - `pageId`: `1510965252`
   - `limit`: 50

2. Look through the returned pages for a title that matches today's meeting date (e.g. "Meeting Minutes – 15 May 2026" or similar date format).

3. **If a matching page exists:**
   - Tell the user: "A meeting minutes page for [date] already exists in Confluence. Would you like me to update it with this transcript?"
   - Wait for confirmation before doing anything.
   - If yes → go to **Update existing page** below.
   - If no → stop. Don't save anything.

4. **If no matching page exists:**
   - Tell the user: "No meeting minutes page found for [date] in the default folder. Where would you like me to create it?"
   - Give the user two options:
     a. "Save it in the default Meeting Minutes folder" (parent ID `1510965252`)
     b. "Somewhere else — please share the Confluence page URL or folder name you'd like it saved under"
   - If the user provides a different URL, extract the page ID from it (it appears as a numeric ID in the path, e.g. `/pages/1234567890/`). Use that as the `parentId`.
   - If the user provides a page name instead of a URL, use `searchConfluenceUsingCql` with `title = "[name]" AND space = "Binq"` to look it up and get its ID.
   - Once you have a confirmed location → go to **Create new page** below.
   - If the user says no or doesn't want to save → stop.

---

### Step 5 — Save to Confluence

#### Create new page

Use `createConfluencePage`:
- `cloudId`: `intelligentlending.atlassian.net`
- `spaceId`: retrieve using `getConfluenceSpaces` filtering for key `Binq` if not already known
- `parentId`: the page ID confirmed with the user in Step 4 (default: `1510965252`)
- `title`: `Meeting Minutes – [DD MMM YYYY]` (e.g. "Meeting Minutes – 15 May 2026")
- `contentFormat`: `markdown`
- `body`: the full meeting minutes output from Step 2
- After creation, add the label `AI`

#### Update existing page

Use `updateConfluencePage`:
- `cloudId`: `intelligentlending.atlassian.net`
- `pageId`: [ID of the existing page]
- `contentFormat`: `markdown`
- `body`: the updated meeting minutes
- `versionMessage`: `Updated by AI from transcript`
- After update, ensure the label `AI` is present on the page

#### Adding the AI label

After creating or updating, add the label `AI` to the page. Use `Atlassian:searchConfluenceUsingCql` or the Confluence labels API if a direct label tool is available. If no label tool is available, mention to the user: "I've saved the page — please manually add the 'AI' label in Confluence."

---

## Tone and style rules

- Write like a smart colleague summarizing a meeting for someone who wasn't there
- Use simple, direct English — no corporate jargon unless it was used in the meeting and matters
- Past tense for what happened ("The team decided...", "Sarah raised a concern about...")
- Avoid vague phrases like "various topics were discussed" — be specific
- If something was unclear in the transcript, write "[unclear]" rather than guessing

---

## Edge cases

**Transcript has no speaker labels** — Still extract content. Note at the top: "Speaker attribution not available."

**Very short meeting (under 10 min)** — Skip the table format. Use a brief paragraph summary + bullets for action items.

**Very long meeting (1+ hour)** — Group discussion points by agenda item or theme. Add a one-line "TL;DR" at the very top before the full minutes.

**Multiple languages** — Write the minutes in the same language the user used to ask, regardless of the transcript language. Note the original language at the top.

**Sensitive content** — If the transcript contains HR, legal, or confidential discussions, include a note: "⚠️ This summary contains sensitive content. Handle accordingly."