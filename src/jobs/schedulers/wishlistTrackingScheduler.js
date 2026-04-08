const wishlistTrackingQueue = require("../queues/wishlistTrackingQueue");
const prisma = require("../../config/prisma");
const chunkArray = require("../../modules/wishlist/utils/chunkArray");

async function scheduleDueWishlistItems() {
  const now = new Date();

  const dueItems = await prisma.wishlistItem.findMany({
    where: {
      isTrackingEnabled: true,
      OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
    },
    select: {
      id: true,
    },
    orderBy: {
      nextCheckAt: "asc",
    },
    take: 200,
  });

  console.log(
    `[wishlistTrackingScheduler] Found ${dueItems.length} due items at ${now.toISOString()}`,
  );

  if (!dueItems.length) {
    return {
      ok: true,
      scheduledBatches: 0,
      dueItems: 0,
      message: "No due wishlist items found",
    };
  }

  const itemIds = dueItems.map((item) => item.id);
  const batches = chunkArray(itemIds, 25);

  console.log(
    `[wishlistTrackingScheduler] Enqueuing ${batches.length} batches for ${itemIds.length} items`,
  );

  for (const [index, batchItemIds] of batches.entries()) {
    await wishlistTrackingQueue.add(
      "process-wishlist-batch",
      {
        itemIds: batchItemIds,
        scheduledAt: now.toISOString(),
      },
      {
        jobId: `wishlist-batch:${now.getTime()}:${index}`,
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }

  return {
    ok: true,
    scheduledBatches: batches.length,
    dueItems: itemIds.length,
  };
}

async function initWishlistTrackingScheduler() {
  await wishlistTrackingQueue.upsertJobScheduler(
    "wishlist-due-items-scheduler",
    {
      every: 360 * 60 * 1000,
    },
    {
      name: "schedule-due-wishlist-items",
      data: {},
      opts: {
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    },
  );

  console.log("[wishlistTrackingScheduler] initialized");
}

async function runWishlistTrackingBootstrap() {
  await wishlistTrackingQueue.add(
    "schedule-due-wishlist-items",
    {},
    {
      jobId: "wishlist-bootstrap-run",
      removeOnComplete: true,
      removeOnFail: 50,
    },
  );

  console.log("[wishlistTrackingScheduler] bootstrap queued");
}

module.exports = {
  scheduleDueWishlistItems,
  initWishlistTrackingScheduler,
  runWishlistTrackingBootstrap,
};
