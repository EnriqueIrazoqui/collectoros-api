const wishlistAlertsRepository = require("./wishlistAlerts.repository");

async function getWishlistAlerts(userId) {
  const alerts = await wishlistAlertsRepository.getAlertsByUserId(userId);

  return alerts;
}

async function markWishlistAlertAsRead(userId, alertId) {
  return wishlistAlertsRepository.markAlertAsRead(alertId, userId);
}

async function markAllWishlistAlertsAsRead(userId) {
  return wishlistAlertsRepository.markAllAlertsAsRead(userId);
}

async function getWishlistAlertsUnreadCount(userId) {
  return wishlistAlertsRepository.getUnreadCount(userId);
}

module.exports = {
  getWishlistAlerts,
  markWishlistAlertAsRead,
  markAllWishlistAlertsAsRead,
  getWishlistAlertsUnreadCount,
};