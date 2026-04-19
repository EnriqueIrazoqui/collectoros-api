const wishlistAlertTypes = {
  TARGET_REACHED: "target_reached",
  PRICE_DROPPED: "price_dropped",
  SIGNIFICANT_DROP: "significant_drop",
  TRACKING_ERROR: "tracking_error",
};

const wishlistAlertStatus = {
  UNREAD: "unread",
  READ: "read",
  ARCHIVED: "archived",
};

const wishlistCheckStatus = {
  SUCCESS: "success",
  ERROR: "error",
  NOT_FOUND: "not_found",
  RATE_LIMITED: "rate_limited",
  BOT_PROTECTION: "bot_protection",
};

module.exports = {
  wishlistAlertTypes,
  wishlistAlertStatus,
  wishlistCheckStatus,
};