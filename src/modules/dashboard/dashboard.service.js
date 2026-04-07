const analyticsService = require("../analytics/analytics.service");
const alertsService = require("../alerts/insights/alerts.service");
const dashboardRepository = require("./dashboard.repository");

async function getDashboard(userId) {
  const [
    analyticsSummary,
    portfolio,
    topItems,
    wishlistOpportunities,
    inventoryMovers,
    recentInventoryItems,
    recentWishlistItems,
  ] = await Promise.all([
    analyticsService.getAnalyticsSummary(userId),
    analyticsService.getPortfolioAnalytics(userId),
    analyticsService.getTopItems(userId),
    alertsService.getWishlistOpportunities(userId),
    alertsService.getInventoryMovers(userId),
    dashboardRepository.getRecentInventoryItems(userId),
    dashboardRepository.getRecentWishlistItems(userId),
  ]);

  return {
    analyticsSummary,
    portfolio,
    topItems,
    wishlistOpportunities,
    inventoryMovers,
    recentInventoryItems,
    recentWishlistItems,
  };
}

module.exports = {
  getDashboard,
};