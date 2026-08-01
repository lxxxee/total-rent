import { readFile } from "node:fs/promises";

export async function loadRentals() {
  const url = new URL("../data/rentals.json", import.meta.url);
  const data = JSON.parse(await readFile(url, "utf8"));
  return data.rentals;
}

export function rentalSummary(rental) {
  const review = rental.needsReview ? " ⚠️ ต้องตรวจสอบ" : "";
  return [
    `🚗 ${rental.plate}${review}`,
    `📅 ${rental.startDate} ถึง ${rental.endDate} (${rental.days} วัน)`,
    `จ่าย RM ${rental.totalPay.toLocaleString()} | รับ RM ${rental.totalGet.toLocaleString()}`,
    `สุทธิ RM ${rental.net.toLocaleString()}`
  ].join("\n");
}

export function answerCommand(text, rentals, siteUrl = "") {
  const command = text.trim().toLowerCase();
  if (["help", "ช่วย", "เมนู", "สวัสดี"].includes(command)) {
    return [
      "เมนู Total Rent",
      "• สรุป — ดูยอดรวมทั้งหมด",
      "• ล่าสุด — ดูรายการล่าสุด",
      "• ทะเบียน VHH7933 — ค้นหารถ",
      "• เว็บ — เปิดหน้า Dashboard"
    ].join("\n");
  }

  if (command === "สรุป" || command === "summary") {
    const net = rentals.reduce((sum, rental) => sum + rental.net, 0);
    const review = rentals.filter((rental) => rental.needsReview).length;
    return `📊 ทั้งหมด ${rentals.length} รายการ\nยอดสุทธิ RM ${net.toLocaleString()}\nรอตรวจสอบ ${review} รายการ`;
  }

  if (command === "ล่าสุด" || command === "latest") {
    const latest = [...rentals].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    return latest ? rentalSummary(latest) : "ยังไม่มีข้อมูลการเช่า";
  }

  if (command === "เว็บ" || command === "web") {
    return siteUrl ? `เปิด Dashboard: ${siteUrl}` : "ยังไม่ได้ตั้งค่า URL ของเว็บไซต์";
  }

  const plate = command.replace(/^ทะเบียน\s*/u, "").toUpperCase().replace(/\s/g, "");
  const rental = rentals.find((item) => item.plate.toUpperCase() === plate);
  if (rental) return rentalSummary(rental);

  return "ไม่พบคำสั่งนี้ พิมพ์ “เมนู” เพื่อดูคำสั่งที่ใช้ได้";
}
