Scaffold a new client folder structure for the client named: $ARGUMENTS

Create the following directory and file structure under `clients/`:

```
clients/CLIENT_NAME/
  project-artefacts/     ← intake summaries, charters, risk scans, PRDs
  sprint-artefacts/      ← sprint SOWs, sprint reports
  meeting-notes/         ← meeting minutes
  user-stories/          ← epics and story files
  README.md              ← one-liner: client name, project name, current phase
```

Replace CLIENT_NAME with the name provided. Use uppercase for the folder name (e.g. ACME, GLOBEX).

After creating the structure, confirm the folders were created and remind the user that `clients/` is excluded from version control — client data stays local only.
