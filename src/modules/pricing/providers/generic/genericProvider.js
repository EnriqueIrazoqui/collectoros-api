const genericProvider = {
  id: "generic",

  canHandle() {
    return true;
  },

  async fetch(wishlistItem) {
    return {
      success: false,
      errorCode: "UNSUPPORTED_PROVIDER",
      message: `Store not supported yet for URL: ${wishlistItem?.purchaseUrl || "unknown"}`,
      store: "generic",
      source: "generic-provider",
      availability: "unknown",
    };
  },
};

module.exports = genericProvider;