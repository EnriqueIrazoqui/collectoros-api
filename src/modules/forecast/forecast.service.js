const AppError = require("../../common/errors/app-error");
const forecastRepository = require("./forecast.repository");

function roundNumber(value) {
  return Number(value.toFixed(2));
}

function calculateMovingAverage(values) {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return sum / values.length;
}

function calculateLinearRegressionProjection(values, futureOffset = 30) {
  const n = values.length;

  if (n < 2) {
    return null;
  }

  const xValues = values.map((_, index) => index + 1);
  const yValues = values;

  const sumX = xValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const sumY = yValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const sumXY = xValues.reduce(
    (accumulator, currentValue, index) => accumulator + currentValue * yValues[index],
    0,
  );
  const sumXX = xValues.reduce(
    (accumulator, currentValue) => accumulator + currentValue * currentValue,
    0,
  );

  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    return null;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const projectedX = n + futureOffset;
  const projectedY = slope * projectedX + intercept;

  return {
    slope,
    intercept,
    projectedPrice: projectedY,
  };
}

function calculateSignal({ lastPrice, projectedPrice, changePercent }) {
  if (lastPrice == null || projectedPrice == null) {
    return "hold";
  }

  if (projectedPrice > lastPrice && changePercent > 5) {
    return "hold";
  }

  if (projectedPrice < lastPrice && changePercent < -5) {
    return "sell-watch";
  }

  if (changePercent <= -10) {
    return "buy";
  }

  return "hold";
}

async function getForecastByItemId(userId, itemId) {
  const inventoryItem = await forecastRepository.findInventoryItemById(itemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  const priceHistory = await forecastRepository.getPriceHistoryByItemId(itemId);

  if (priceHistory.length === 0) {
    return {
      itemId: inventoryItem.id,
      itemName: inventoryItem.name,
      category: inventoryItem.category,
      historyCount: 0,
      averagePrice: null,
      movingAverage: null,
      lastPrice: null,
      projectedPriceIn30Days: null,
      trend: "stable",
      signal: "hold",
    };
  }

  const prices = priceHistory.map((entry) => entry.price || 0);
  const averagePrice = calculateMovingAverage(prices);

  const recentPrices = prices.slice(-3);
  const movingAverage = calculateMovingAverage(recentPrices);

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

  const regression = calculateLinearRegressionProjection(prices, 30);
  const projectedPriceIn30Days = regression
    ? Math.max(0, regression.projectedPrice)
    : null;

  const signal = calculateSignal({
    lastPrice,
    projectedPrice: projectedPriceIn30Days,
    changePercent,
  });

  return {
    itemId: inventoryItem.id,
    itemName: inventoryItem.name,
    category: inventoryItem.category,
    historyCount: priceHistory.length,
    averagePrice: roundNumber(averagePrice),
    movingAverage: roundNumber(movingAverage),
    lastPrice: roundNumber(lastPrice),
    projectedPriceIn30Days:
      projectedPriceIn30Days != null ? roundNumber(projectedPriceIn30Days) : null,
    trend,
    changePercent: roundNumber(changePercent),
    signal,
    history: priceHistory.map((entry) => ({
      id: entry.id,
      price: roundNumber(entry.price),
      source: entry.source,
      createdAt: entry.createdAt,
    })),
  };
}

module.exports = {
  getForecastByItemId,
};