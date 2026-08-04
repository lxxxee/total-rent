const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function sumItems(items = []) {
  return items.reduce(
    (totals, item) => ({
      pay: totals.pay + Number(item.pay || 0),
      getBack: totals.getBack + Number(item.getBack || 0)
    }),
    { pay: 0, getBack: 0 }
  );
}

export function validateRental(rental) {
  const errors = [];
  const warnings = [];
  const requiredText = ["id", "plate", "startDate", "endDate"];

  for (const field of requiredText) {
    if (typeof rental[field] !== "string" || !rental[field].trim()) {
      errors.push(`${field} is required`);
    }
  }

  if (rental.startDate && !ISO_DATE.test(rental.startDate)) errors.push("startDate must use YYYY-MM-DD");
  if (rental.endDate && !ISO_DATE.test(rental.endDate)) errors.push("endDate must use YYYY-MM-DD");
  if (ISO_DATE.test(rental.startDate || "") && ISO_DATE.test(rental.endDate || "") && rental.endDate < rental.startDate) {
    errors.push("endDate cannot be before startDate");
  }

  for (const field of ["vehicleCost", "totalPay", "totalGet", "net", "days"]) {
    if (!Number.isFinite(rental[field])) errors.push(`${field} must be numeric`);
  }

  if (!Array.isArray(rental.items)) {
    errors.push("items must be an array");
    return { errors, warnings, totals: { pay: 0, getBack: 0 } };
  }

  rental.items.forEach((item, index) => {
    if (!Number.isFinite(item.pay) || !Number.isFinite(item.getBack)) {
      errors.push(`items[${index}] Pay and Get Back must be numeric`);
    }
  });

  const totals = sumItems(rental.items);
  if (totals.pay !== rental.totalPay) warnings.push(`item Pay ${totals.pay} differs from reported totalPay ${rental.totalPay}`);
  if (totals.getBack !== rental.totalGet) warnings.push(`item Get Back ${totals.getBack} differs from totalGet ${rental.totalGet}`);
  if (Number.isFinite(rental.reportedTotalGet) && rental.reportedTotalGet !== totals.getBack) {
    warnings.push(`reported Total Get ${rental.reportedTotalGet} differs from item Get Back ${totals.getBack}`);
  }

  return { errors, warnings, totals };
}

export function validateDataset(dataset) {
  const errors = [];
  const warnings = [];
  const seen = new Set();

  if (!dataset || !Array.isArray(dataset.rentals)) return { errors: ["rentals must be an array"], warnings };

  for (const rental of dataset.rentals) {
    if (seen.has(rental.id)) errors.push(`duplicate rental id: ${rental.id}`);
    seen.add(rental.id);
    const result = validateRental(rental);
    errors.push(...result.errors.map((message) => `${rental.id}: ${message}`));
    warnings.push(...result.warnings.map((message) => `${rental.id}: ${message}`));
  }

  return { errors, warnings };
}
