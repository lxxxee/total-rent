import readline from "node:readline";
import { loadRentals, rentalSummary } from "../lib/rentals.js";

const tools = [
  { name: "list_rentals", description: "List all vehicle rental summaries", inputSchema: { type: "object", properties: {} } },
  { name: "find_rental", description: "Find a rental by vehicle plate", inputSchema: { type: "object", properties: { plate: { type: "string" } }, required: ["plate"] } }
];

async function handle(message) {
  const { id, method, params = {} } = message;
  if (method === "initialize") return { jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "total-rent", version: "1.0.0" } } };
  if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools } };
  if (method === "tools/call") {
    const rentals = await loadRentals();
    let text;
    if (params.name === "list_rentals") text = rentals.map(rentalSummary).join("\n\n");
    else if (params.name === "find_rental") {
      const rental = rentals.find((item) => item.plate.toUpperCase() === String(params.arguments?.plate).toUpperCase());
      text = rental ? rentalSummary(rental) : "Rental not found";
    } else return { jsonrpc: "2.0", id, error: { code: -32601, message: "Tool not found" } };
    return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }] } };
  }
  if (id === undefined) return null;
  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

const input = readline.createInterface({ input: process.stdin });
input.on("line", async (line) => {
  try {
    const response = await handle(JSON.parse(line));
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: error.message } })}\n`);
  }
});
