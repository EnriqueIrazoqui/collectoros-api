const inventoryTrackingQueue = require("../queues/inventoryTrackingQueue");
const prisma = require("../../config/prisma");
const chunkArray = require("../../modules/wishlist/utils/chunkArray");

async function scheduleDueInventoryItems() {
  const now = new Date();

  const dueItems = await prisma.inventoryItem.findMany({
    where: {
      isTrackingEnabled: true,
      trackingUrl: { not: null },
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
    `[inventoryTrackingScheduler] Found ${dueItems.length} due items`,
  );

  if (!dueItems.length) {
    return;
  }

  const itemIds = dueItems.map((item) => item.id);

  // 🔥 mismo patrón que wishlist (evita duplicados)
  const reservationDate = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.inventoryItem.updateMany({
    where: {
      id: { in: itemIds },
    },
    data: {
      nextCheckAt: reservationDate,
    },
  });

  const batches = chunkArray(itemIds, 25);

  for (const [index, batchItemIds] of batches.entries()) {
    await inventoryTrackingQueue.add(
      "process-inventory-batch",
      {
        itemIds: batchItemIds,
        scheduledAt: now.toISOString(),
      },
      {
        jobId: `inventory-batch:${index}:${batchItemIds.join("-")}`,
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }
}

async function initInventoryTrackingScheduler() {
  await inventoryTrackingQueue.upsertJobScheduler(
    "inventory-due-items-scheduler",
    {
      every: 5 * 60 * 1000, // 🔥 5 minutos (igual que wishlist)
    },
    {
      name: "schedule-due-inventory-items",
      data: {},
    },
  );

  console.log("[inventoryTrackingScheduler] initialized");
}

module.exports = {
  scheduleDueInventoryItems,
  initInventoryTrackingScheduler,
};