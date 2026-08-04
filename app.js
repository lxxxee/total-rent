const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });
const shortDate = new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short", year: "numeric" });
const repoIssueUrl = "https://github.com/lxxxee/total-rent/issues/new";
const data = await fetch("/data/rentals.json").then((response) => {
  if (!response.ok) throw new Error("Approved rental data could not be loaded.");
  return response.json();
});
const rentals = [...data.rentals].sort((a, b) => b.startDate.localeCompare(a.startDate));

const byId = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const date = (value) => shortDate.format(new Date(`${value}T00:00:00`));
const itemTotals = (items) => items.reduce((sum, item) => ({ pay: sum.pay + item.pay, getBack: sum.getBack + item.getBack }), { pay: 0, getBack: 0 });

byId("updated").textContent = `${rentals.length} approved sessions · newest first`;

function renderStats() {
  const vehicleCost = rentals.reduce((sum, item) => sum + item.vehicleCost, 0);
  const pay = rentals.reduce((sum, item) => sum + item.totalPay, 0);
  const getBack = rentals.reduce((sum, item) => sum + item.totalGet, 0);
  const net = rentals.reduce((sum, item) => sum + item.net, 0);
  const review = rentals.filter((item) => item.needsReview).length;
  const stats = [
    ["Reported net", money.format(net), net >= 0 ? "positive" : "negative"],
    ["Vehicle cost", money.format(vehicleCost), ""],
    ["Total Pay", money.format(pay), ""],
    ["Total Get Back", money.format(getBack), "positive"],
    ["Needs Review", String(review), review ? "warning" : "positive"]
  ];
  byId("stats").innerHTML = stats.map(([label, value, color]) => `<article><p>${label}</p><strong class="${color}">${value}</strong></article>`).join("");
}

function card(rental) {
  const totals = itemTotals(rental.items);
  const reportedGet = Number.isFinite(rental.reportedTotalGet) ? rental.reportedTotalGet : rental.totalGet;
  const netPerDay = rental.days ? rental.net / rental.days : 0;
  const status = rental.needsReview ? "Needs Review" : "Approved";
  const rows = rental.items.map((item, index) => `<tr><td>${index + 1}</td><td>${money.format(item.pay)}</td><td>${money.format(item.getBack)}</td><td>${escapeHtml(item.status || "recorded")}</td></tr>`).join("");
  return `<details class="rental" data-id="${escapeHtml(rental.id)}">
    <summary>
      <div class="session-mark"><span></span></div>
      <div class="summary-copy"><div class="row"><h3>${escapeHtml(rental.plate)}</h3><span class="badge ${rental.needsReview ? "review" : "approved"}">${status}</span></div><p>${date(rental.startDate)} — ${date(rental.endDate)}</p></div>
      <div class="summary-net"><small>Reported net</small><strong class="${rental.net >= 0 ? "positive" : "negative"}">${money.format(rental.net)}</strong></div>
      <span class="chevron">⌄</span>
    </summary>
    <div class="rental-body">
      <div class="metrics">
        <div><span>Vehicle cost</span><strong>${money.format(rental.vehicleCost)}</strong></div>
        <div><span>Total Pay</span><strong>${money.format(rental.totalPay)}</strong></div>
        <div><span>Item Get Back</span><strong>${money.format(totals.getBack)}</strong></div>
        <div><span>Net / day</span><strong>${money.format(netPerDay)}</strong></div>
      </div>
      ${rental.needsReview ? `<div class="review-panel"><strong>Review required</strong><p>Reported Total Get ${money.format(reportedGet)} differs from item Get Back ${money.format(totals.getBack)}. Original evidence is preserved.</p></div>` : ""}
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Pay</th><th>Get Back</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="note">${escapeHtml(rental.note || "No notes")}</p>
      <div class="card-actions"><button class="secondary edit" type="button" data-id="${escapeHtml(rental.id)}">Edit request</button><button class="secondary archive" type="button" data-id="${escapeHtml(rental.id)}">Archive request</button><button class="danger delete-request" type="button" data-id="${escapeHtml(rental.id)}">Delete request</button></div>
    </div>
  </details>`;
}

function render() {
  const query = byId("search").value.trim().toLowerCase();
  const status = byId("status-filter").value;
  const filtered = rentals.filter((item) => item.plate.toLowerCase().includes(query))
    .filter((item) => status === "all" || (status === "review" ? item.needsReview : !item.needsReview));
  byId("rentals").innerHTML = filtered.map(card).join("");
  byId("empty").hidden = filtered.length > 0;
}

function issueUrl(title, body) {
  const url = new URL(repoIssueUrl);
  url.searchParams.set("template", "rental_intake.yml");
  url.searchParams.set("title", title);
  url.searchParams.set("body", body);
  return url.toString();
}

function openRequest(type = "add", rental = null) {
  byId("request-type").value = type;
  byId("dialog-title").textContent = type === "edit" ? `Edit ${rental.plate}` : "Add rental";
  byId("form-plate").value = rental?.plate || "";
  byId("form-cost").value = rental?.vehicleCost || "";
  byId("form-start").value = rental?.startDate || "";
  byId("form-end").value = rental?.endDate || "";
  byId("form-items").value = rental?.items.map((item) => `Pay RM ${item.pay} Get Back RM ${item.getBack}`).join("\n") || "";
  byId("form-notes").value = rental ? `Edit request for ${rental.id}\nCurrent note: ${rental.note || "None"}` : "";
  byId("rental-dialog").showModal();
}

renderStats();
render();
byId("search").addEventListener("input", render);
byId("status-filter").addEventListener("change", render);
byId("add-rental").addEventListener("click", () => openRequest());
byId("rentals").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const rental = rentals.find((item) => item.id === button.dataset.id);
  if (button.classList.contains("edit")) return openRequest("edit", rental);
  const action = button.classList.contains("archive") ? "Archive" : "Delete";
  const body = `${action} request for approved rental ${rental.id} (${rental.plate}).\n\nDo not permanently delete this record. Codex must review this request and preserve the audit trail.`;
  window.open(issueUrl(`${action} request: ${rental.plate}`, body), "_blank", "noopener,noreferrer");
});
byId("rental-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const type = byId("request-type").value;
  const plate = byId("form-plate").value.trim().toUpperCase();
  const body = [
    `Request type: ${type}`,
    `Plate: ${plate}`,
    `Date: ${byId("form-start").value} to ${byId("form-end").value}`,
    `Vehicle cost: RM ${byId("form-cost").value || "0"}`,
    "",
    byId("form-items").value.trim(),
    "",
    `Notes: ${byId("form-notes").value.trim() || "None"}`
  ].join("\n");
  window.open(issueUrl(`Rental intake: ${plate}`, body), "_blank", "noopener,noreferrer");
  byId("rental-dialog").close();
});
