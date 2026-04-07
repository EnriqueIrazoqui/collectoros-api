const AppError = require("../../common/errors/app-error");
const wishlistRepository = require("./wishlist.repository");
const wishlistTrackingQueue = require("../../jobs/queues/wishlistTrackingQueue");
const prisma = require("../../config/prisma");

async function createWishlistItem(userId, payload) {
  const wishlistItem = await wishlistRepository.createWishlistItem({
    userId,
    ...payload,
    currentObservedPrice: null,
    nextCheckAt: null,
    lastCheckedAt: null,
    lastPriceChangeAt: null,
    consecutiveFailures: 0,
    lastCheckStatus: null,
    lastErrorMessage: null,
    lastAvailability: null,
    lastProviderSource: null,
    store: null,
  });

  await wishlistTrackingQueue.add(
    "process-wishlist-batch",
    {
      itemIds: [wishlistItem.id],
    },
    {
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );

  return wishlistItem;
}

async function getWishlistItems(userId, options) {
  return wishlistRepository.findWishlistItemsByUserId(userId, options);
}

async function getWishlistItemById(userId, wishlistItemId) {
  const wishlistItem =
    await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem || wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  return wishlistItem;
}

async function createTargetReachedAlertIfNeeded(updatedWishlistItem) {
  const currentObservedPrice = Number(updatedWishlistItem.currentObservedPrice);
  const targetPrice = Number(updatedWishlistItem.targetPrice);

  if (!Number.isFinite(currentObservedPrice) || !Number.isFinite(targetPrice)) {
    return;
  }

  if (currentObservedPrice > targetPrice) {
    return;
  }

  const existingUnreadTargetReached = await prisma.wishlistAlert.findFirst({
    where: {
      userId: updatedWishlistItem.userId,
      wishlistItemId: updatedWishlistItem.id,
      type: "target_reached",
      status: "unread",
    },
  });

  if (existingUnreadTargetReached) {
    return;
  }

  await prisma.wishlistAlert.create({
    data: {
      userId: updatedWishlistItem.userId,
      wishlistItemId: updatedWishlistItem.id,
      type: "target_reached",
      title: "Target price reached",
      message: `${updatedWishlistItem.name} reached your target price.`,
      status: "unread",
      priority: "medium",
      triggeredPrice: currentObservedPrice,
      previousPrice: updatedWishlistItem.currentObservedPrice,
      targetPrice,
      triggeredAt: new Date(),
    },
  });
}

async function updateWishlistItem(userId, wishlistItemId, payload) {
  const wishlistItem =
    await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem || wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  const sanitizedPayload = { ...payload };

  // El observed price no debe venir del usuario en flujo normal
  delete sanitizedPayload.currentObservedPrice;

  const purchaseUrlChanged =
    Object.prototype.hasOwnProperty.call(sanitizedPayload, "purchaseUrl") &&
    String(sanitizedPayload.purchaseUrl || "").trim() !==
      String(wishlistItem.purchaseUrl || "").trim();

  const targetPriceChanged =
    Object.prototype.hasOwnProperty.call(sanitizedPayload, "targetPrice") &&
    Number(sanitizedPayload.targetPrice ?? 0) !==
      Number(wishlistItem.targetPrice ?? 0);

  const updateData = {
    ...sanitizedPayload,
  };

  if (purchaseUrlChanged) {
    updateData.currentObservedPrice = null;
    updateData.nextCheckAt = null;
    updateData.lastCheckedAt = null;
    updateData.lastPriceChangeAt = null;
    updateData.consecutiveFailures = 0;
    updateData.lastCheckStatus = null;
    updateData.lastErrorMessage = null;
    updateData.lastAvailability = null;
    updateData.lastProviderSource = null;
    updateData.store = null;
  }

  const updatedWishlistItem = await wishlistRepository.updateWishlistItem(
    wishlistItemId,
    updateData,
  );

  if (purchaseUrlChanged) {
    await wishlistTrackingQueue.add(
      "process-wishlist-batch",
      {
        itemIds: [updatedWishlistItem.id],
      },
      {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );

    return updatedWishlistItem;
  }

  if (targetPriceChanged) {
    await createTargetReachedAlertIfNeeded(updatedWishlistItem);
  }

  return updatedWishlistItem;
}

async function deleteWishlistItem(userId, wishlistItemId) {
  const wishlistItem =
    await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem || wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  await wishlistRepository.deleteWishlistItem(wishlistItemId);

  return null;
}

module.exports = {
  createWishlistItem,
  getWishlistItems,
  getWishlistItemById,
  updateWishlistItem,
  deleteWishlistItem,
};