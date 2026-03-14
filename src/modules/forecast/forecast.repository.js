const prisma = require("../../config/prisma");

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
      currentEstimatedValue: true,
      purchasePrice: true,
      quantity: true,
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
  findInventoryItemById,
  getPriceHistoryByItemId,
};