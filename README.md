# Total Rent

A private GitHub repository for tracking vehicle rentals, profit or loss, and Pay/Get Back items.

This repository is **Private**. You must be signed in to an authorized GitHub account to access the data.

## Codex + Spark workflow

`data/rentals.json` is the single source of truth for approved financial data.

1. Submit a private GitHub issue using the **Rental Intake** template.
2. The `rental-inbox` workflow parses it into `data/pending-changes.json` and opens a review pull request.
3. Codex validates dates, items, reported values, and discrepancies.
4. Only validated records move into `data/rentals.json`.
5. Gemini Spark regenerates the Excel workbook and presentation layer from approved data.

Website edits, archive requests, and delete requests also enter the review queue. Approved records are never silently deleted.

## Dashboard, LINE Bot, and MCP

This repository includes an English mobile dashboard, a LINE Messaging API webhook, and a local MCP server. See [`SETUP-LINE.md`](SETUP-LINE.md) for the one-time LINE setup checklist.

```bash
npm start  # dashboard at http://localhost:3000
npm run validate:data
npm run build
npm test
npm run mcp
```

The generated workbook is stored at `exports/Total-Rent.xlsx`. It is a reporting artifact; approved JSON remains authoritative.
