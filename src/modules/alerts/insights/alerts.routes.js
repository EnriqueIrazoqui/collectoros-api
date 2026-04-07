const express = require("express");

const authMiddleware = require("../../../middlewares/auth.middleware");
const alertsController = require("./alerts.controller");

const router = express.Router();

/**
 * @openapi
 * /alerts/wishlist-opportunities:
 *   get:
 *     summary: Get wishlist opportunities for the authenticated user
 *     tags:
 *       - Alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist opportunities retrieved successfully
 */
router.get(
  "/wishlist-opportunities",
  authMiddleware,
  alertsController.getWishlistOpportunities,
);

/**
 * @openapi
 * /alerts/inventory-movers:
 *   get:
 *     summary: Get rising and falling inventory items based on price history
 *     tags:
 *       - Alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory movers retrieved successfully
 */
router.get(
  "/inventory-movers",
  authMiddleware,
  alertsController.getInventoryMovers,
);

module.exports = router;