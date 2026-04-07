const prisma = require("../../../config/prisma");

async function getWishlistItemsByUserId(userId) {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      category: true,
      targetPrice: true,
      currentObservedPrice: true,
      priority: true,
      purchaseUrl: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getInventoryItemsWithPriceHistoryByUserId(userId) {
  return prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      category: true,
      currentEstimatedValue: true,
      priceHistory: {
        select: {
          id: true,
          price: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

module.exports = {
  getWishlistItemsByUserId,
  getInventoryItemsWithPriceHistoryByUserId,
};