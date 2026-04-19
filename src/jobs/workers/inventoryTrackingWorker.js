const { Worker } = require("bullmq");
const prisma = require("../../config/prisma");
const redisConnection = require("../../config/redis");
const fetchObservedPrice = require("../../modules/pricing/services/fetchObservedPrice");

const calculateNextCheckAt = require("../../modules/wishlist/utils/calculateNextCheckAt");
const calculateRetryCheckAt = require("../../modules/wishlist/utils/calculateRetryCheckAt");

const {
  scheduleDueInventoryItems,
} = require("../schedulers/inventoryTrackingScheduler");

const inventoryTrackingWorker = new Worker(
  "inventoryTrackingQueue",
  async (job) => {
    console.log("[inventoryTrackingWorker] Job:", job.name);

    if (job.name === "schedule-due-inventory-items") {
      return scheduleDueInventoryItems();
    }

    if (job.name !== "process-inventory-batch") {
      return;
    }

    const { itemIds = [] } = job.data;

    const items = await prisma.inventoryItem.findMany({
      where: {
        id: { in: itemIds },
      },
    });

    for (const item of items) {
      try {
        const result = await fetchObservedPrice({
          ...item,
          purchaseUrl: item.trackingUrl,
        });

        if (!result.success) {
          const failures = (item.consecutiveFailures || 0) + 1;

          await prisma.inventoryItem.update({
            where: { id: item.id },
            data: {
              lastCheckedAt: new Date(),
              nextCheckAt: calculateRetryCheckAt(
                failures,
                item.trackingFrequencyHours,
              ),
              consecutiveFailures: failures,
              lastCheckStatus: "error",
              lastErrorMessage: result.message,
              lastAvailability: "unknown",
            },
          });

          continue;
        }

        const oldPrice = item.currentEstimatedValue;
        const newPrice = result.price;

        const priceChanged =
          oldPrice == null || Number(oldPrice) !== Number(newPrice);

        // historial automático
        if (priceChanged) {
          await prisma.priceHistory.create({
            data: {
              itemId: item.id,
              price: newPrice,
              previousPrice: oldPrice,
              currency: result.currency || item.currency,
              source: result.source,
            },
          });
        }

        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            currentEstimatedValue: newPrice,
            lastCheckedAt: new Date(),
            nextCheckAt: calculateNextCheckAt(item.trackingFrequencyHours),
            lastPriceChangeAt: priceChanged
              ? new Date()
              : item.lastPriceChangeAt,
            consecutiveFailures: 0,
            lastCheckStatus: "success",
            lastErrorMessage: null,
            store: result.store || item.store,
            lastAvailability: result.availability || "unknown",
            lastProviderSource: result.source,
          },
        });

        console.log(`[inventoryTrackingWorker] Item ${item.id} updated`);
      } catch (error) {
        const failures = (item.consecutiveFailures || 0) + 1;

        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            lastCheckedAt: new Date(),
            nextCheckAt: calculateRetryCheckAt(
              failures,
              item.trackingFrequencyHours,
            ),
            consecutiveFailures: failures,
            lastCheckStatus: "error",
            lastErrorMessage: error.message,
            lastAvailability: "unknown",
          },
        });
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

module.exports = inventoryTrackingWorker;
