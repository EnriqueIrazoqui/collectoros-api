const wishlistItemStatus = {
  BUY_NOW: "buy_now",
  NEAR_TARGET: "near_target",
  PRICE_DROPPED: "price_dropped",
  TRACKING_ERROR: "tracking_error",
  WATCHING: "watching",
};

const NEAR_TARGET_PERCENTAGE = 10;

function getWishlistItemStatus(item, alerts = []) {
  const targetPrice = Number(item?.targetPrice || 0);
  const observedPrice = Number(item?.currentObservedPrice || 0);

  const itemAlerts = alerts.filter(
    (alert) => Number(alert.wishlistItemId) === Number(item.id),
  );

  const hasUnreadTrackingError = itemAlerts.some(
    (alert) =>
      alert.status === "unread" &&
      String(alert.type || "").toLowerCase() === "tracking_error",
  );

  if (hasUnreadTrackingError) {
    return wishlistItemStatus.TRACKING_ERROR;
  }

  if (targetPrice > 0 && observedPrice > 0 && observedPrice <= targetPrice) {
    return wishlistItemStatus.BUY_NOW;
  }

  const hasUnreadPriceDropped = itemAlerts.some(
    (alert) =>
      alert.status === "unread" &&
      String(alert.type || "").toLowerCase() === "price_dropped",
  );

  if (hasUnreadPriceDropped) {
    return wishlistItemStatus.PRICE_DROPPED;
  }

  if (targetPrice > 0 && observedPrice > 0) {
    const differencePercent = ((observedPrice - targetPrice) / targetPrice) * 100;

    if (differencePercent > 0 && differencePercent <= NEAR_TARGET_PERCENTAGE) {
      return wishlistItemStatus.NEAR_TARGET;
    }
  }

  return wishlistItemStatus.WATCHING;
}

module.exports = {
  wishlistItemStatus,
  getWishlistItemStatus,
};