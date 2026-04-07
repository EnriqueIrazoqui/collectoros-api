const { Worker } = require("bullmq");
const prisma = require("../../config/prisma");
const redisConnection = require("../../config/redis");
const fetchObservedPrice = require("../../modules/pricing/services/fetchObservedPrice");
const maybeCreateWishlistAlerts = require("../../modules/wishlist/services/maybeCreateWishlistAlerts");
const calculateNextCheckAt = require("../../modules/wishlist/utils/calculateNextCheckAt");
const calculateRetryCheckAt = require("../../modules/wishlist/utils/calculateRetryCheckAt");
const { wishlistCheckStatus } = require("../../modules/wishlist/wishlist.constants");

const wishlistTrackingWorker = new Worker(
  "wishlistTrackingQueue",
  async (job) => {
    if (job.name !== "process-wishlist-batch") {
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

    for (const item of items) {
      try {
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

        const shouldCreateHistory =
          existingHistoryCount === 0 || priceChanged;

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
        }

        const updatedItem = await prisma.wishlistItem.update({
          where: {
            id: item.id,
          },
          data: {
            currentObservedPrice: newPrice,
            lastCheckedAt: new Date(),
            nextCheckAt: calculateNextCheckAt(item.trackingFrequencyHours),
            lastPriceChangeAt: priceChanged ? new Date() : item.lastPriceChangeAt,
            consecutiveFailures: 0,
            lastCheckStatus: wishlistCheckStatus.SUCCESS,
            lastErrorMessage: null,
            store: result.store || item.store,
            lastAvailability: result.availability || "unknown",
            lastProviderSource: result.source || null,
          },
        });

        await maybeCreateWishlistAlerts({
          item: updatedItem,
          oldPrice,
          newPrice,
        });
      } catch (error) {
        const failures = (item.consecutiveFailures || 0) + 1;

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
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

module.exports = wishlistTrackingWorker;