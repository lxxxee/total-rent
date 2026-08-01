import test from "node:test";
import assert from "node:assert/strict";
import { answerCommand, loadRentals } from "../lib/rentals.js";
import { validSignature } from "../api/webhook.js";

test("summary uses current rental totals", async () => {
  const rentals = await loadRentals();
  assert.match(answerCommand("สรุป", rentals), /ยอดสุทธิ RM 2,870/);
});

test("finds a rental by plate", async () => {
  const rentals = await loadRentals();
  assert.match(answerCommand("ทะเบียน VHF2040", rentals), /สุทธิ RM 159/);
});

test("validates LINE webhook signatures", () => {
  const signature = "dzJZAsrKgS3CWXM6rNBGtzgXNyx3e42VtAJkdHRRbhM=";
  assert.equal(validSignature("{}", signature, "secret"), true);
  assert.equal(validSignature("changed", signature, "secret"), false);
});
