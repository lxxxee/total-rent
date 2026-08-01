# Total Rent

A private GitHub repository for tracking vehicle rentals, profit or loss, and Pay/Get Back items.

This repository is **Private**. You must be signed in to an authorized GitHub account to access the data.

## How to add new data

1. Open `inbox.md` on GitHub and paste the raw rental information.
2. Commit the change.
3. Ask Codex: `Organize Total Rent data`.
4. Codex will review the information, verify the totals, sort the records by date, and update `data/rentals.json`.

Codex maintains the organized records in `data/rentals.json` and keeps the repository summary up to date.

## Dashboard, LINE Bot, and MCP

This repository now includes a Thai dashboard, a LINE Messaging API webhook, and a local MCP server. See [`SETUP-LINE.md`](SETUP-LINE.md) for the one-time setup checklist.

```bash
npm start  # dashboard at http://localhost:3000
npm test   # verify bot commands
npm run mcp
```
