import test from "node:test";
import assert from "node:assert/strict";
import { answerCommand, loadRentals } from "../lib/rentals.js";
import { validateDataset } from "../lib/validation.js";
import { validSignature } from "../api/webhook.js";
import { parseInbox } from "../scripts/import-inbox.mjs";

test("summary uses current rental totals", async () => {
  const rentals = await loadRentals();
  assert.match(answerCommand("summary", rentals), /Reported net RM 2,870/);
});

test("finds a rental by plate", async () => {
  const rentals = await loadRentals();
  assert.match(answerCommand("VHF2040", rentals), /Reported net RM 159/);
});

test("approved data has no schema errors and preserves review warnings", async () => {
  const rentals = await loadRentals();
  const result = validateDataset({ rentals });
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some((warning) => warning.includes("vhh7933") && warning.includes("reported Total Get")));
});

test("rejects duplicate IDs and invalid date bounds", () => {
  const rental = { id: "duplicate", plate: "TEST1", startDate: "2026-08-05", endDate: "2026-08-01", vehicleCost: 0, totalPay: 0, totalGet: 0, net: 0, days: 1, items: [] };
  const result = validateDataset({ rentals: [rental, rental] });
  assert.ok(result.errors.some((error) => error.includes("duplicate rental id")));
  assert.ok(result.errors.some((error) => error.includes("endDate cannot be before startDate")));
});

test("parses clear rental intake into a pending Codex review", () => {
  const parsed = parseInbox("VHH1234\nVehicle cost RM 2,000\nPay RM 105 Get Back RM 170\nPay RM 65 Get Back RM 170");
  assert.equal(parsed.plate, "VHH1234");
  assert.equal(parsed.vehicleCost, 2000);
  assert.equal(parsed.items.length, 2);
  assert.equal(parsed.status, "pending_codex_review");
});

test("validates LINE webhook signatures", () => {
  const signature = "dzJZAsrKgS3CWXM6rNBGtzgXNyx3e42VtAJkdHRRbhM=";
  assert.equal(validSignature("{}", signature, "secret"), true);
  assert.equal(validSignature("changed", signature, "secret"), false);
});
