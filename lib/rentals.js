import { readFile } from "node:fs/promises";

export async function loadRentals() {
  const url = new URL("../data/rentals.json", import.meta.url);
  const data = JSON.parse(await readFile(url, "utf8"));
  return data.rentals;
}

export function rentalSummary(rental) {
  const review = rental.needsReview ? " ⚠️ Needs Review" : "";
  return [
    `🚗 ${rental.plate}${review}`,
    `📅 ${rental.startDate} to ${rental.endDate} (${rental.days} days)`,
    `Pay RM ${rental.totalPay.toLocaleString()} | Get Back RM ${rental.totalGet.toLocaleString()}`,
    `Reported net RM ${rental.net.toLocaleString()}`
  ].join("\n");
}

export function answerCommand(text, rentals, siteUrl = "") {
  const command = text.trim().toLowerCase();
  if (["help", "menu"].includes(command)) {
    return [
      "Total Rent menu",
      "• summary — view approved totals",
      "• latest — view the latest session",
      "• VHH7933 — find a plate",
      "• web — open the dashboard"
    ].join("\n");
  }

  if (command === "summary") {
    const net = rentals.reduce((sum, rental) => sum + rental.net, 0);
    const review = rentals.filter((rental) => rental.needsReview).length;
    return `📊 ${rentals.length} approved sessions\nReported net RM ${net.toLocaleString()}\nNeeds Review ${review}`;
  }

  if (command === "latest") {
    const latest = [...rentals].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    return latest ? rentalSummary(latest) : "No approved rental data yet";
  }

  if (command === "web") {
    return siteUrl ? `Open dashboard: ${siteUrl}` : "The private dashboard URL is not configured";
  }

  const plate = command.replace(/^plate\s*/u, "").toUpperCase().replace(/\s/g, "");
  const rental = rentals.find((item) => item.plate.toUpperCase() === plate);
  if (rental) return rentalSummary(rental);

  return "Command not found. Type “menu” to see available commands.";
}
