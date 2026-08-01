const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
const data = await fetch("/data/rentals.json").then((response) => response.json());
const rentals = data.rentals;

document.querySelector("#updated").textContent = `ข้อมูล ${rentals.length} รายการ`;
const net = rentals.reduce((sum, item) => sum + item.net, 0);
const received = rentals.reduce((sum, item) => sum + item.totalGet, 0);
const review = rentals.filter((item) => item.needsReview).length;
document.querySelector("#stats").innerHTML = [
  ["ยอดสุทธิ", money.format(net), "green"], ["ยอดรับทั้งหมด", money.format(received), ""], ["รอตรวจสอบ", `${review} รายการ`, review ? "amber" : ""]
].map(([label, value, color]) => `<article><p>${label}</p><strong class="${color}">${value}</strong></article>`).join("");

function render(query = "") {
  document.querySelector("#rentals").innerHTML = rentals.filter((item) => item.plate.toLowerCase().includes(query.toLowerCase())).map((item) => `
    <article class="rental"><div class="row"><h3>${item.plate}</h3>${item.needsReview ? '<span class="badge">ตรวจสอบ</span>' : '<span class="badge ok">เรียบร้อย</span>'}</div>
    <p>${item.startDate} → ${item.endDate}</p><hr><div class="row"><span>สุทธิ</span><strong>${money.format(item.net)}</strong></div>
    <div class="detail"><span>จ่าย ${money.format(item.totalPay)}</span><span>รับ ${money.format(item.totalGet)}</span></div></article>`).join("") || "<p>ไม่พบทะเบียนรถ</p>";
}
render();
document.querySelector("#search").addEventListener("input", (event) => render(event.target.value));
