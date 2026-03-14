const AppError = require("../../common/errors/app-error");
const inventoryRepository = require("./inventory.repository");

function normalizeInventoryPayload(payload) {
  return {
    ...payload,
    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null,
    quantity: payload.quantity ?? 1,
  };
}

async function createInventoryItem(userId, payload) {
  const normalizedPayload = normalizeInventoryPayload(payload);

  const inventoryItem = await inventoryRepository.createInventoryItem({
    userId,
    ...normalizedPayload,
  });

  return inventoryItem;
}

async function getInventoryItems(userId) {
  return inventoryRepository.findInventoryItemsByUserId(userId);
}

async function getInventoryItemById(userId, inventoryItemId) {
  const inventoryItem = await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  return inventoryItem;
}

async function updateInventoryItem(userId, inventoryItemId, payload) {
  const inventoryItem = await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  const normalizedPayload = {
    ...payload,
  };

  if (Object.prototype.hasOwnProperty.call(payload, "purchaseDate")) {
    normalizedPayload.purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : null;
  }

  return inventoryRepository.updateInventoryItem(inventoryItemId, normalizedPayload);
}

async function deleteInventoryItem(userId, inventoryItemId) {
  const inventoryItem = await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  await inventoryRepository.deleteInventoryItem(inventoryItemId);

  return null;
}

module.exports = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
};