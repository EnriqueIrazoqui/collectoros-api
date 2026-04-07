function extractAmazonAsin(url = "") {
  const normalizedUrl = String(url);

  const dpMatch = normalizedUrl.match(/\/dp\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1].toUpperCase();

  const gpMatch = normalizedUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1].toUpperCase();

  const genericMatch = normalizedUrl.match(/([A-Z0-9]{10})/i);
  if (genericMatch) return genericMatch[1].toUpperCase();

  return null;
}

module.exports = extractAmazonAsin;