const AppError = require("../../common/errors/app-error");
const inventoryRepository = require("../inventory/inventory.repository");
const priceHistoryRepository = require("./price-history.repository");

async function createPriceHistory(userId, payload) {
  const inventoryItem = await inventoryRepository.findInventoryItemById(
    payload.itemId,
  );

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  const priceHistory = await priceHistoryRepository.createPriceHistory({
    itemId: payload.itemId,
    price: payload.price,
    source: payload.source ?? null,
  });

  await inventoryRepository.updateInventoryItem(payload.itemId, {
    currentEstimatedValue: payload.price,
  });

  return priceHistory;
}

async function getPriceHistoryByItemId(userId, itemId) {
  const inventoryItem = await inventoryRepository.findInventoryItemById(itemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  return priceHistoryRepository.findPriceHistoryByItemId(itemId);
}

async function deletePriceHistory(userId, priceHistoryId) {
  const priceHistory =
    await priceHistoryRepository.findPriceHistoryById(priceHistoryId);

  if (!priceHistory) {
    throw new AppError("Price history entry not found", 404);
  }

  const inventoryItem = await inventoryRepository.findInventoryItemById(
    priceHistory.itemId,
  );

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Price history entry not found", 404);
  }

  await priceHistoryRepository.deletePriceHistory(priceHistoryId);

  const latestRemainingPriceHistory =
    await priceHistoryRepository.findLatestPriceHistoryByItemId(
      priceHistory.itemId,
    );

  const nextCurrentEstimatedValue =
    latestRemainingPriceHistory?.price ?? inventoryItem.purchasePrice ?? null;

  await inventoryRepository.updateInventoryItem(priceHistory.itemId, {
    currentEstimatedValue: nextCurrentEstimatedValue,
  });

  return null;
}

module.exports = {
  createPriceHistory,
  getPriceHistoryByItemId,
  deletePriceHistory,
};
