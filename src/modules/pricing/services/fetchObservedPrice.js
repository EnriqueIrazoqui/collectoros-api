const { resolveProvider } = require("../providers/registry/providerRegistry");

async function fetchObservedPrice(wishlistItem) {
  const purchaseUrl = wishlistItem?.purchaseUrl;

  if (!purchaseUrl) {
    return {
      success: false,
      errorCode: "MISSING_URL",
      message: "Wishlist item does not have a purchase URL.",
      store: "generic",
      source: "fetchObservedPrice",
      availability: "unknown",
    };
  }

  const provider = resolveProvider(purchaseUrl);

  if (!provider) {
    return {
      success: false,
      errorCode: "UNSUPPORTED_PROVIDER",
      message: "Could not resolve a provider for the purchase URL.",
      store: "generic",
      source: "fetchObservedPrice",
      availability: "unknown",
    };
  }

  return provider.fetch(wishlistItem);
}

module.exports = fetchObservedPrice;