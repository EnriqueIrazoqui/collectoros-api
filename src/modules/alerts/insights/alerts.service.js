const alertsRepository = require("./alerts.repository");

const NEAR_TARGET_PERCENTAGE = 10;

function roundNumber(value) {
  return Number(value.toFixed(2));
}

async function getWishlistOpportunities(userId) {
  const wishlistItems = await alertsRepository.getWishlistItemsByUserId(userId);

  const buyNow = [];
  const nearTarget = [];

  for (const item of wishlistItems) {
    const targetPrice = item.targetPrice;
    const currentObservedPrice = item.currentObservedPrice;

    if (targetPrice == null || currentObservedPrice == null) {
      continue;
    }

    const difference = currentObservedPrice - targetPrice;
    const differencePercent =
      targetPrice > 0 ? (difference / targetPrice) * 100 : 0;

    const mappedItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      priority: item.priority,
      purchaseUrl: item.purchaseUrl,
      targetPrice: roundNumber(targetPrice),
      currentObservedPrice: roundNumber(currentObservedPrice),
      difference: roundNumber(difference),
      differencePercent: roundNumber(differencePercent),
    };

    if (currentObservedPrice <= targetPrice) {
      buyNow.push(mappedItem);
      continue;
    }

    if (differencePercent <= NEAR_TARGET_PERCENTAGE) {
      nearTarget.push(mappedItem);
    }
  }

  buyNow.sort((a, b) => a.difference - b.difference);
  nearTarget.sort((a, b) => a.differencePercent - b.differencePercent);

  return {
    buyNow,
    nearTarget,
    meta: {
      nearTargetPercentage: NEAR_TARGET_PERCENTAGE,
      buyNowCount: buyNow.length,
      nearTargetCount: nearTarget.length,
    },
  };
}

async function getInventoryMovers(userId) {
  const inventoryItems = await alertsRepository.getInventoryItemsWithPriceHistoryByUserId(userId);

  const risingItems = [];
  const fallingItems = [];

  for (const item of inventoryItems) {
    if (!item.priceHistory || item.priceHistory.length < 2) {
      continue;
    }

    const firstPrice = item.priceHistory[0].price || 0;
    const lastPrice = item.priceHistory[item.priceHistory.length - 1].price || 0;

    if (firstPrice <= 0) {
      continue;
    }

    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;

    const mappedItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      firstPrice: roundNumber(firstPrice),
      lastPrice: roundNumber(lastPrice),
      change: roundNumber(change),
      changePercent: roundNumber(changePercent),
      historyCount: item.priceHistory.length,
    };

    if (changePercent > 0) {
      risingItems.push(mappedItem);
    } else if (changePercent < 0) {
      fallingItems.push(mappedItem);
    }
  }

  risingItems.sort((a, b) => b.changePercent - a.changePercent);
  fallingItems.sort((a, b) => a.changePercent - b.changePercent);

  return {
    risingItems: risingItems.slice(0, 10),
    fallingItems: fallingItems.slice(0, 10),
  };
}

module.exports = {
  getWishlistOpportunities,
  getInventoryMovers,
};