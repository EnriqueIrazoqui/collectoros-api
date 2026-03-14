const prisma = require("../../config/prisma");

async function getInventorySummary(userId) {
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    select: {
      quantity: true,
      purchasePrice: true,
      currentEstimatedValue: true,
    },
  });

  return inventoryItems;
}

async function getWishlistSummary(userId) {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    select: {
      targetPrice: true,
      currentObservedPrice: true,
    },
  });

  return wishlistItems;
}

module.exports = {
  getInventorySummary,
  getWishlistSummary,
};