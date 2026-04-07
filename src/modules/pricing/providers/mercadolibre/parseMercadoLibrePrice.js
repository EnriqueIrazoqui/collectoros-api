function parseMercadoLibrePrice(priceText = "") {
  const raw = String(priceText).trim();

  if (!raw) {
    return null;
  }

  const cleaned = raw.replace(/[^\d.,]/g, "");

  if (!cleaned) {
    return null;
  }

  const commaCount = (cleaned.match(/,/g) || []).length;
  const dotCount = (cleaned.match(/\./g) || []).length;

  let normalized = cleaned;

  if (commaCount > 0 && dotCount > 0) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (commaCount > 0) {
    if (cleaned.includes(",") && cleaned.split(",").pop().length <= 2) {
      normalized = cleaned.replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (dotCount > 0) {
    if (cleaned.includes(".") && cleaned.split(".").pop().length <= 2) {
      normalized = cleaned;
    } else {
      normalized = cleaned.replace(/\./g, "");
    }
  }

  const price = Number(normalized);

  return Number.isFinite(price) ? price : null;
}

module.exports = parseMercadoLibrePrice;