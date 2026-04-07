const { Worker } = require("bullmq");
const prisma = require("../../config/prisma");
const redisConnection = require("../../config/redis");
const fetchObservedPrice = require("../../modules/pricing/services/fetchObservedPrice");
const maybeCreateWishlistAlerts = require("../../modules/wishlist/services/maybeCreateWishlistAlerts");
const calculateNextCheckAt = require("../../modules/wishlist/utils/calculateNextCheckAt");
const calculateRetryCheckAt = require("../../modules/wishlist/utils/calculateRetryCheckAt");
const {
  wishlistCheckStatus,
} = require("../../modules/wishlist/wishlist.constants");
const {
  scheduleDueWishlistItems,
} = require("../schedulers/wishlistTrackingScheduler");

const wishlistTrackingWorker = new Worker(
  "wishlistTrackingQueue",
  async (job) => {
    console.log(
      "[wishlistTrackingWorker] Processing job:",
      job.name,
      "id:",
      job.id,
    );

    switch (job.name) {
      case "schedule-due-wishlist-items":
        console.log(
          "[wishlistTrackingWorker] Running scheduleDueWishlistItems at:",
          new Date().toISOString(),
        );
        return scheduleDueWishlistItems();

      case "process-wishlist-batch":
        console.log(
          "[wishlistTrackingWorker] Processing batch with itemIds:",
          job.data?.itemIds || [],
        );
        break;

      default:
        console.log("[wishlistTrackingWorker] Unknown job received:", job.name);
        return;
    }

    const { itemIds = [] } = job.data;

    const items = await prisma.wishlistItem.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });

    console.log(
      `[wishlistTrackingWorker] Found ${items.length} wishlist items for batch`,
    );

    for (const item of items) {
      try {
        console.log(
          `[wishlistTrackingWorker] Fetching observed price for item ${item.id}`,
        );

        const result = await fetchObservedPrice(item);

        if (!result.success) {
          throw new Error(
            `[${result.errorCode || "FETCH_ERROR"}] ${
              result.message || "Could not fetch observed price"
            }`,
          );
        }

        const oldPrice = item.currentObservedPrice;
        const newPrice = result.price;

        const priceChanged =
          oldPrice == null || Number(oldPrice) !== Number(newPrice);

        const existingHistoryCount = await prisma.wishlistPriceHistory.count({
          where: {
            wishlistItemId: item.id,
          },
        });

        const shouldCreateHistory = existingHistoryCount === 0 || priceChanged;

        if (shouldCreateHistory) {
          await prisma.wishlistPriceHistory.create({
            data: {
              wishlistItemId: item.id,
              price: newPrice,
              previousPrice: oldPrice,
              currency: result.currency || item.currency,
              source: result.source,
            },
          });

          console.log(
            `[wishlistTrackingWorker] Price history created for item ${item.id}`,
          );
        }

        const updatedItem = await prisma.wishlistItem.update({
          where: {
            id: item.id,
          },
          data: {
            currentObservedPrice: newPrice,
            lastCheckedAt: new Date(),
            nextCheckAt: calculateNextCheckAt(item.trackingFrequencyHours),
            lastPriceChangeAt: priceChanged
              ? new Date()
              : item.lastPriceChangeAt,
            consecutiveFailures: 0,
            lastCheckStatus: wishlistCheckStatus.SUCCESS,
            lastErrorMessage: null,
            store: result.store || item.store,
            lastAvailability: result.availability || "unknown",
            lastProviderSource: result.source || null,
          },
        });

        console.log(
          `[wishlistTrackingWorker] Item ${item.id} updated successfully`,
        );

        await maybeCreateWishlistAlerts({
          item: updatedItem,
          oldPrice,
          newPrice,
        });

        console.log(
          `[wishlistTrackingWorker] Alerts evaluated for item ${item.id}`,
        );
      } catch (error) {
        const failures = (item.consecutiveFailures || 0) + 1;

        console.error(
          `[wishlistTrackingWorker] Error processing item ${item.id}:`,
          error.message,
        );

        await prisma.wishlistItem.update({
          where: {
            id: item.id,
          },
          data: {
            lastCheckedAt: new Date(),
            nextCheckAt: calculateRetryCheckAt(
              failures,
              item.trackingFrequencyHours,
            ),
            consecutiveFailures: failures,
            lastCheckStatus: wishlistCheckStatus.ERROR,
            lastErrorMessage: error.message || "Unknown error",
            lastAvailability: "unknown",
          },
        });

        console.log(
          `[wishlistTrackingWorker] Retry scheduled for item ${item.id}`,
        );
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

wishlistTrackingWorker.on("completed", (job) => {
  console.log(
    "[wishlistTrackingWorker] Completed job:",
    job.name,
    "id:",
    job.id,
  );
});

wishlistTrackingWorker.on("failed", (job, error) => {
  console.error(
    "[wishlistTrackingWorker] Failed job:",
    job?.name,
    "id:",
    job?.id,
    "error:",
    error?.message,
  );
});

module.exports = wishlistTrackingWorker;
