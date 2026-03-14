const express = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");
const priceHistoryRoutes = require("../modules/price-history/price-history.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/price-history", priceHistoryRoutes);


module.exports = router;