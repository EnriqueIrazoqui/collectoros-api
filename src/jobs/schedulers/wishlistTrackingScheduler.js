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

  // Reservar temporalmente los items para evitar que otra corrida los vuelva a tomar
  const reservationDate = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.wishlistItem.updateMany({
    where: {
      id: {
        in: itemIds,
      },
    },
    data: {
      nextCheckAt: reservationDate,
    },
  });

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
        // jobId estable para evitar duplicados del mismo lote
        jobId: `wishlist-batch:${index}:${batchItemIds.join("-")}`,
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
      every: 5 * 60 * 1000, // 3 horas
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
  console.log(
    "[wishlistTrackingScheduler] bootstrap skipped to avoid duplicate scheduling",
  );
}

module.exports = {
  scheduleDueWishlistItems,
  initWishlistTrackingScheduler,
  runWishlistTrackingBootstrap,
};