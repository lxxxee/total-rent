import crypto from "node:crypto";
import { answerCommand, loadRentals } from "../lib/rentals.js";

function validSignature(rawBody, signature, secret) {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  const actual = Buffer.from(signature || "");
  const expected = Buffer.from(digest);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function reply(token, text, accessToken) {
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ replyToken: token, messages: [{ type: "text", text }] })
  });
  if (!response.ok) throw new Error(`LINE reply failed: ${response.status}`);
}

export default async function handler(request, response) {
  if (request.method === "GET") return response.status(200).json({ ok: true, service: "total-rent-line" });
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });

  const secret = process.env.LINE_CHANNEL_SECRET;
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !accessToken) return response.status(503).json({ error: "line_not_configured" });

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!validSignature(raw, request.headers["x-line-signature"], secret)) {
    return response.status(401).json({ error: "invalid_signature" });
  }

  const body = JSON.parse(raw);
  const allowed = (process.env.LINE_ALLOWED_USER_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);
  const rentals = await loadRentals();
  const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";

  await Promise.all((body.events || []).map(async (event) => {
    if (event.type !== "message" || event.message?.type !== "text" || !event.replyToken) return;
    if (allowed.length && !allowed.includes(event.source?.userId)) return;
    await reply(event.replyToken, answerCommand(event.message.text, rentals, siteUrl), accessToken);
  }));
  return response.status(200).json({ ok: true });
}

export { validSignature };

export const config = { api: { bodyParser: false } };
