const AppError = require("../../common/errors/app-error");
const analyticsRepository = require("./analytics.repository");

function sumValues(values) {
  return values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function roundNumber(value) {
  return Number(value.toFixed(2));
}

async function getAnalyticsSummary(userId) {
  const inventoryItems = await analyticsRepository.getInventorySummary(userId);
  const wishlistItems = await analyticsRepository.getWishlistSummary(userId);

  const totalInventoryItems = inventoryItems.length;

  const totalQuantity = sumValues(
    inventoryItems.map((item) => item.quantity || 0),
  );

  const totalInvestedAmount = sumValues(
    inventoryItems.map((item) => (item.quantity || 0) * (item.purchasePrice || 0)),
  );

  const totalCurrentEstimatedValue = sumValues(
    inventoryItems.map((item) => (item.quantity || 0) * (item.currentEstimatedValue || 0)),
  );

  const unrealizedGainLoss = totalCurrentEstimatedValue - totalInvestedAmount;

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
      totalInvestedAmount: roundNumber(totalInvestedAmount),
      totalCurrentEstimatedValue: roundNumber(totalCurrentEstimatedValue),
      unrealizedGainLoss: roundNumber(unrealizedGainLoss),
    },
    wishlist: {
      totalItems: totalWishlistItems,
      totalTargetValue: roundNumber(totalWishlistTargetValue),
      totalCurrentObservedValue: roundNumber(totalWishlistCurrentObservedValue),
    },
  };
}

async function getPortfolioAnalytics(userId) {
  const inventoryItems = await analyticsRepository.getInventoryItemsByUserId(userId);

  const itemsCount = inventoryItems.length;

  const totalQuantity = sumValues(
    inventoryItems.map((item) => item.quantity || 0),
  );

  const investedAmount = sumValues(
    inventoryItems.map((item) => (item.quantity || 0) * (item.purchasePrice || 0)),
  );

  const portfolioValue = sumValues(
    inventoryItems.map((item) => (item.quantity || 0) * (item.currentEstimatedValue || 0)),
  );

  const profit = portfolioValue - investedAmount;
  const profitPercent = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;

  return {
    itemsCount,
    totalQuantity,
    investedAmount: roundNumber(investedAmount),
    portfolioValue: roundNumber(portfolioValue),
    profit: roundNumber(profit),
    profitPercent: roundNumber(profitPercent),
  };
}

async function getTopItems(userId) {
  const inventoryItems = await analyticsRepository.getInventoryItemsByUserId(userId);

  const mappedItems = inventoryItems.map((item) => {
    const quantity = item.quantity || 0;
    const purchasePrice = item.purchasePrice || 0;
    const currentEstimatedValue = item.currentEstimatedValue || 0;

    const totalPurchaseValue = quantity * purchasePrice;
    const totalCurrentValue = quantity * currentEstimatedValue;
    const gain = totalCurrentValue - totalPurchaseValue;

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity,
      totalPurchaseValue: roundNumber(totalPurchaseValue),
      totalCurrentValue: roundNumber(totalCurrentValue),
      gain: roundNumber(gain),
    };
  });

  const topValuableItems = [...mappedItems]
    .sort((a, b) => b.totalCurrentValue - a.totalCurrentValue)
    .slice(0, 5);

  const topProfitableItems = [...mappedItems]
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5);

  return {
    topValuableItems,
    topProfitableItems,
  };
}

async function getItemTrend(userId, itemId) {
  const inventoryItem = await analyticsRepository.findInventoryItemById(itemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  const priceHistory = await analyticsRepository.getPriceHistoryByItemId(itemId);

  if (priceHistory.length === 0) {
    return {
      itemId: inventoryItem.id,
      itemName: inventoryItem.name,
      trend: "stable",
      lastPrice: null,
      averagePrice: null,
      changePercent: 0,
      historyCount: 0,
    };
  }

  const prices = priceHistory.map((entry) => entry.price || 0);
  const averagePrice = sumValues(prices) / prices.length;
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];

  const changePercent =
    firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  let trend = "stable";

  if (changePercent > 1) {
    trend = "up";
  } else if (changePercent < -1) {
    trend = "down";
  }

  return {
    itemId: inventoryItem.id,
    itemName: inventoryItem.name,
    trend,
    lastPrice: roundNumber(lastPrice),
    averagePrice: roundNumber(averagePrice),
    changePercent: roundNumber(changePercent),
    historyCount: priceHistory.length,
  };
}

module.exports = {
  getAnalyticsSummary,
  getPortfolioAnalytics,
  getTopItems,
  getItemTrend,
};