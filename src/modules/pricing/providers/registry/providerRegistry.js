const amazonProvider = require("../amazon/amazonProvider");
const mercadolibreProvider = require("../mercadolibre/mercadoLibreProvider");
const genericProvider = require("../generic/genericProvider");

const providers = [
  amazonProvider,
  mercadolibreProvider,
  genericProvider,
];

function resolveProvider(url) {
  return providers.find((p) => p.canHandle(url)) || null;
}

module.exports = {
  resolveProvider,
};