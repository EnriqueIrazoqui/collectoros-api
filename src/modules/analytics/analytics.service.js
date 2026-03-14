const analyticsRepository = require("./analytics.repository");

function sumValues(values) {
  return values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

async function getAnalyticsSummary(userId) {
  const inventoryItems = await analyticsRepository.getInventorySummary(userId);
  const wishlistItems = await analyticsRepository.getWishlistSummary(userId);

  const totalInventoryItems = inventoryItems.length;

  const totalQuantity = sumValues(
    inventoryItems.map((item) => item.quantity || 0),
  );

  const totalInvestedAmount = sumValues(
    inventoryItems.map((item) => {
      const quantity = item.quantity || 0;
      const purchasePrice = item.purchasePrice || 0;

      return quantity * purchasePrice;
    }),
  );

  const totalCurrentEstimatedValue = sumValues(
    inventoryItems.map((item) => {
      const quantity = item.quantity || 0;
      const currentEstimatedValue = item.currentEstimatedValue || 0;

      return quantity * currentEstimatedValue;
    }),
  );

  const unrealizedGainLoss =
    totalCurrentEstimatedValue - totalInvestedAmount;

  const totalWishlistItems = wishlistItems.length;

  const totalWishlistTargetValue = sumValues(
    wishlistItems.map((item) => item.targetPrice || 0),
  );

  const totalWishlistCurrentObservedValue = sumValues(
    wishlistItems.map((item) => item.currentObservedPrice || 0),
  );

  return {
    inventory: {
      totalItems: totalInventoryItems,
      totalQuantity,
      totalInvestedAmount,
      totalCurrentEstimatedValue,
      unrealizedGainLoss,
    },
    wishlist: {
      totalItems: totalWishlistItems,
      totalTargetValue: totalWishlistTargetValue,
      totalCurrentObservedValue: totalWishlistCurrentObservedValue,
    },
  };
}

module.exports = {
  getAnalyticsSummary,
};