const prisma = require("../../config/prisma");
const wishlistTrackingQueue = require("../queues/wishlistTrackingQueue");
const chunkArray = require("../../modules/wishlist/utils/chunkArray");

async function scheduleDueWishlistItems() {
  const now = new Date();

  const dueItems = await prisma.wishlistItem.findMany({
    where: {
      isTrackingEnabled: true,
      OR: [
        { nextCheckAt: null },
        { nextCheckAt: { lte: now } },
      ],
    },
    select: {
      id: true,
    },
    orderBy: {
      nextCheckAt: "asc",
    },
    take: 200,
  });

  if (!dueItems.length) {
    return;
  }

  const itemIds = dueItems.map((item) => item.id);
  const batches = chunkArray(itemIds, 25);

  for (const batchItemIds of batches) {
    await wishlistTrackingQueue.add("process-wishlist-batch", {
      itemIds: batchItemIds,
    });
  }
}

module.exports = {
  scheduleDueWishlistItems,
};