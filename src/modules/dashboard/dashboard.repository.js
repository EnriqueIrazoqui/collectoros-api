const prisma = require("../../config/prisma");

async function getRecentInventoryItems(userId) {
  return prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      category: true,
      quantity: true,
      currentEstimatedValue: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
}

async function getRecentWishlistItems(userId) {
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
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
}

module.exports = {
  getRecentInventoryItems,
  getRecentWishlistItems,
};