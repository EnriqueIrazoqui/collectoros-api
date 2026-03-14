const express = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const inventoryRoutes = require("../modules/inventory/inventory.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);

module.exports = router;