function parseAmazonPrice(priceText = "") {
  const cleaned = String(priceText)
    .replace(/\s/g, "")
    .replace(/[^0-9.,]/g, "");

  if (!cleaned) {
    return null;
  }

  // Case 1: 1,234.56
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const normalized = cleaned.replace(/,/g, "");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }

  // Case 2: 1234,56
  if (cleaned.includes(",") && !cleaned.includes(".")) {
    const normalized = cleaned.replace(",", ".");
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }

  // Case 3: 1234.56
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

module.exports = parseAmazonPrice;