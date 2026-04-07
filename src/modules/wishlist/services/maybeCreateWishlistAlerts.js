const prisma = require("../../../config/prisma");
const {
  wishlistAlertTypes,
  wishlistAlertStatus,
} = require("../wishlist.constants");

async function maybeCreateWishlistAlerts({ item, oldPrice, newPrice }) {
  if (oldPrice != null && newPrice < oldPrice) {
    await prisma.wishlistAlert.create({
      data: {
        wishlistItemId: item.id,
        userId: item.userId,
        type: wishlistAlertTypes.PRICE_DROPPED,
        title: "Price dropped",
        message: `${item.name} dropped from ${oldPrice} to ${newPrice}`,
        status: wishlistAlertStatus.UNREAD,
        triggeredPrice: newPrice,
        previousPrice: oldPrice,
        targetPrice: item.targetPrice,
      },
    });
  }

  if (
    item.targetPrice != null &&
    newPrice <= item.targetPrice &&
    (oldPrice == null || oldPrice > item.targetPrice)
  ) {
    const existingUnreadTargetReached = await prisma.wishlistAlert.findFirst({
      where: {
        userId: item.userId,
        wishlistItemId: item.id,
        type: wishlistAlertTypes.TARGET_REACHED,
        status: wishlistAlertStatus.UNREAD,
      },
    });

    if (!existingUnreadTargetReached) {
      await prisma.wishlistAlert.create({
        data: {
          wishlistItemId: item.id,
          userId: item.userId,
          type: wishlistAlertTypes.TARGET_REACHED,
          title: "Target price reached",
          message: `${item.name} reached your target price`,
          status: wishlistAlertStatus.UNREAD,
          triggeredPrice: newPrice,
          previousPrice: oldPrice,
          targetPrice: item.targetPrice,
        },
      });
    }
  }
}

module.exports = maybeCreateWishlistAlerts;