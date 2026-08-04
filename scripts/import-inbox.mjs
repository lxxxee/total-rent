import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

function amountAfter(label, text) {
  const match = text.match(new RegExp(`${label}\\s*(?:RM)?\\s*([0-9,]+(?:\\.[0-9]{1,2})?)`, "i"));
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

export function parseInbox(text) {
  const plate = text.match(/\b[A-Z]{1,3}\s?\d{3,4}\b/i)?.[0]?.replaceAll(" ", "").toUpperCase() || null;
  const items = [...text.matchAll(/pay\s*(?:RM)?\s*([0-9,.]+)\s*[,;\-]?\s*(?:get(?:\s*back)?)\s*(?:RM)?\s*([0-9,.]+)/gi)].map((match) => ({
    pay: Number(match[1].replaceAll(",", "")),
    getBack: Number(match[2].replaceAll(",", ""))
  }));
  const missing = [];
  if (!plate) missing.push("plate");
  if (!items.length) missing.push("Pay/Get Back items");

  return {
    plate,
    vehicleCost: amountAfter("vehicle\\s*cost[:\\s]*", text),
    reportedTotalPay: amountAfter("total\\s*pay[:\\s]*", text),
    reportedTotalGet: amountAfter("total\\s*get[:\\s]*", text),
    reportedNet: amountAfter("(?:reported\\s*)?net(?:\\s*after\\s*all\\s*costs)?[:\\s]*", text),
    items,
    rawText: text.trim(),
    status: missing.length ? "needs_review" : "pending_codex_review",
    missing
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const body = process.env.ISSUE_BODY || (await readFile(new URL("../inbox.md", import.meta.url), "utf8"));
  const parsed = parseInbox(body);

  if (args.includes("--preview")) {
    console.log(JSON.stringify(parsed, null, 2));
  } else {
    const queueUrl = new URL("../data/pending-changes.json", import.meta.url);
    const queue = JSON.parse(await readFile(queueUrl, "utf8"));
    const issueNumber = process.env.ISSUE_NUMBER ? Number(process.env.ISSUE_NUMBER) : null;
    if (issueNumber && queue.changes.some((entry) => entry.sourceIssue === issueNumber)) {
      console.log(`Issue #${issueNumber} is already queued.`);
    } else {
      queue.changes.push({
        id: `pending-${issueNumber || Date.now()}`,
        source: issueNumber ? "github_issue" : "inbox.md",
        sourceIssue: issueNumber,
        createdAt: new Date().toISOString(),
        ...parsed
      });
      await writeFile(queueUrl, `${JSON.stringify(queue, null, 2)}\n`);
      console.log(`Queued ${parsed.plate || "unidentified rental"} for Codex review.`);
    }
  }
}
