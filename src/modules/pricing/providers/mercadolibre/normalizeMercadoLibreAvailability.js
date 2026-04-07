function normalizeMercadoLibreAvailability(text = "") {
  const normalizedText = String(text).toLowerCase().trim();

  if (!normalizedText) {
    return "unknown";
  }

  if (
    normalizedText.includes("sin stock") ||
    normalizedText.includes("agotado") ||
    normalizedText.includes("no disponible") ||
    normalizedText.includes("publicación pausada") ||
    normalizedText.includes("pausada")
  ) {
    return "out_of_stock";
  }

  if (
    normalizedText.includes("disponible") ||
    normalizedText.includes("stock disponible") ||
    normalizedText.includes("última disponible") ||
    normalizedText.includes("último disponible") ||
    normalizedText.includes("disponibles") ||
    normalizedText.includes("disponibles a partir")
  ) {
    return "in_stock";
  }

  return "unknown";
}

module.exports = normalizeMercadoLibreAvailability;