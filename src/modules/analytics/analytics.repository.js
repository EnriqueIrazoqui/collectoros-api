const prisma = require("../../config/prisma");

async function getInventorySummary(userId) {
  return prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      purchasePrice: true,
      currentEstimatedValue: true,
    },
  });
}

async function getWishlistSummary(userId) {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    select: {
      targetPrice: true,
      currentObservedPrice: true,
    },
  });
}

async function getInventoryItemsByUserId(userId) {
  return prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      category: true,
      quantity: true,
      purchasePrice: true,
      currentEstimatedValue: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findInventoryItemById(itemId) {
  return prisma.inventoryItem.findUnique({
    where: {
      id: itemId,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      category: true,
      quantity: true,
      purchasePrice: true,
      currentEstimatedValue: true,
    },
  });
}

async function getPriceHistoryByItemId(itemId) {
  return prisma.priceHistory.findMany({
    where: {
      itemId,
    },
    select: {
      id: true,
      price: true,
      source: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

module.exports = {
  getInventorySummary,
  getWishlistSummary,
  getInventoryItemsByUserId,
  findInventoryItemById,
  getPriceHistoryByItemId,
};