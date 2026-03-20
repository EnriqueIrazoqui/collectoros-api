const AppError = require("../../common/errors/app-error");
const analyticsRepository = require("./analytics.repository");

function sumValues(values) {
  return values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

function roundNumber(value) {
  return Number(value.toFixed(2));
}

function formatGrowthDate(date) {
  return new Date(date).toISOString();
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

async function getPortfolioAllocation(userId) {
  const groupedItems =
    await analyticsRepository.getPortfolioAllocationByCategory(userId);

  const normalized = groupedItems
    .map((item) => {
      const category = item.category || "Uncategorized";
      const totalValue = Number(item._sum.currentEstimatedValue || 0);
      const itemsCount = Number(item._count.id || 0);

      return {
        category,
        totalValue,
        itemsCount,
      };
    })
    .filter((item) => item.totalValue > 0);

  const totalPortfolioValue = normalized.reduce(
    (acc, item) => acc + item.totalValue,
    0,
  );

  const data = normalized
    .map((item) => ({
      ...item,
      percentage:
        totalPortfolioValue > 0
          ? Number(((item.totalValue / totalPortfolioValue) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return {
    totalPortfolioValue,
    categoriesCount: data.length,
    allocation: data,
  };
}

async function getCollectionGrowth(userId) {
  const inventoryItems =
    await analyticsRepository.getInventoryItemsWithPriceHistoryByUserId(userId);

  const events = [];

  inventoryItems.forEach((item) => {
    const quantity = Number(item.quantity || 0);

    item.priceHistory.forEach((entry) => {
      events.push({
        itemId: item.id,
        itemName: item.name,
        quantity,
        price: Number(entry.price || 0),
        createdAt: entry.createdAt,
      });
    });
  });

  if (events.length === 0) {
    return {
      startValue: 0,
      currentValue: 0,
      growthAmount: 0,
      growthPercent: 0,
      pointsCount: 0,
      history: [],
    };
  }

  events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const latestPriceByItemId = new Map();
  const history = [];

  events.forEach((event) => {
    latestPriceByItemId.set(event.itemId, {
      itemId: event.itemId,
      itemName: event.itemName,
      quantity: event.quantity,
      price: event.price,
    });

    let totalValue = 0;

    latestPriceByItemId.forEach((entry) => {
      totalValue += Number(entry.quantity || 0) * Number(entry.price || 0);
    });

    history.push({
      date: formatGrowthDate(event.createdAt),
      totalValue: roundNumber(totalValue),
    });
  });

  const consolidatedHistory = history.reduce((accumulator, currentPoint) => {
    const lastPoint = accumulator[accumulator.length - 1];

    if (lastPoint && lastPoint.date === currentPoint.date) {
      lastPoint.totalValue = currentPoint.totalValue;
      return accumulator;
    }

    accumulator.push(currentPoint);
    return accumulator;
  }, []);

  const startValue = Number(consolidatedHistory[0]?.totalValue || 0);
  const currentValue = Number(
    consolidatedHistory[consolidatedHistory.length - 1]?.totalValue || 0,
  );
  const growthAmount = currentValue - startValue;
  const growthPercent =
    startValue > 0 ? (growthAmount / startValue) * 100 : 0;

  return {
    startValue: roundNumber(startValue),
    currentValue: roundNumber(currentValue),
    growthAmount: roundNumber(growthAmount),
    growthPercent: roundNumber(growthPercent),
    pointsCount: consolidatedHistory.length,
    history: consolidatedHistory,
  };
}

async function getTradePerformance(userId) {
  const inventoryItems =
    await analyticsRepository.getInventoryItemsForTradePerformance(userId);

  const normalizedItems = inventoryItems
    .map((item) => {
      const quantity = Number(item.quantity || 0);
      const purchasePrice = Number(item.purchasePrice || 0);
      const currentEstimatedValue = Number(item.currentEstimatedValue || 0);

      const totalPurchaseValue = purchasePrice * quantity;
      const totalCurrentValue = currentEstimatedValue * quantity;
      const profitAmount = totalCurrentValue - totalPurchaseValue;
      const profitPercent =
        totalPurchaseValue > 0
          ? (profitAmount / totalPurchaseValue) * 100
          : 0;

      return {
        id: item.id,
        name: item.name,
        category: item.category || "Uncategorized",
        condition: item.condition || "-",
        quantity,
        purchasePrice: roundNumber(purchasePrice),
        currentEstimatedValue: roundNumber(currentEstimatedValue),
        totalPurchaseValue: roundNumber(totalPurchaseValue),
        totalCurrentValue: roundNumber(totalCurrentValue),
        profitAmount: roundNumber(profitAmount),
        profitPercent: roundNumber(profitPercent),
        purchaseDate: item.purchaseDate,
      };
    })
    .filter((item) => item.totalPurchaseValue > 0);

  if (!normalizedItems.length) {
    return {
      bestTrade: null,
      worstTrade: null,
    };
  }

  const bestTrade = [...normalizedItems].sort(
    (a, b) => b.profitAmount - a.profitAmount,
  )[0];

  const worstTrade = [...normalizedItems].sort(
    (a, b) => a.profitAmount - b.profitAmount,
  )[0];

  return {
    bestTrade,
    worstTrade,
  };
}


module.exports = {
  getAnalyticsSummary,
  getPortfolioAnalytics,
  getTopItems,
  getItemTrend,
  getPortfolioAllocation,
  getCollectionGrowth,
  getTradePerformance,
};