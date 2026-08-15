const express = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");
const priceHistoryRoutes = require("../modules/price-history/price-history.routes");
const wishlistRoutes = require("../modules/wishlist/wishlist.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const alertsRoutes = require("../modules/alerts/insights/alerts.routes");
const forecastRoutes = require("../modules/forecast/forecast.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const wishlistAlertsRoutes = require("../modules/alerts/wishlist-alerts/wishlistAlerts.routes");
const whatsNewRoutes = require("../modules/whats-new/whats-new.routes");
const accessRequestRoutes = require("../modules/access-request/access-request.routes");


const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/price-history", priceHistoryRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/alerts", alertsRoutes);
router.use("/forecast", forecastRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admin", adminRoutes);
router.use("/alerts", wishlistAlertsRoutes);
router.use("/whats-new", whatsNewRoutes);
router.use("/access-requests", accessRequestRoutes);


module.exports = router;