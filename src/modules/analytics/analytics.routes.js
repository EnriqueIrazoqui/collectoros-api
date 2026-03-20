const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const analyticsController = require("./analytics.controller");

const router = express.Router();

/**
 * @openapi
 * /analytics/summary:
 *   get:
 *     summary: Get analytics summary for the authenticated user
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary retrieved successfully
 */
router.get("/summary", authMiddleware, analyticsController.getAnalyticsSummary);

/**
 * @openapi
 * /analytics/portfolio:
 *   get:
 *     summary: Get portfolio analytics for the authenticated user
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio analytics retrieved successfully
 */
router.get(
  "/portfolio",
  authMiddleware,
  analyticsController.getPortfolioAnalytics,
);

/**
 * @openapi
 * /analytics/top-items:
 *   get:
 *     summary: Get top inventory items for the authenticated user
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top items retrieved successfully
 */
router.get("/top-items", authMiddleware, analyticsController.getTopItems);

/**
 * @openapi
 * /analytics/item-trend/{itemId}:
 *   get:
 *     summary: Get price trend for an inventory item
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item trend retrieved successfully
 *       404:
 *         description: Inventory item not found
 */
router.get(
  "/item-trend/:itemId",
  authMiddleware,
  analyticsController.getItemTrend,
);

/**
 * @openapi
 * /analytics/allocation:
 *   get:
 *     summary: Get portfolio allocation by category
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio allocation retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/allocation",
  authMiddleware,
  analyticsController.getPortfolioAllocation,
);

/**
 * @openapi
 * /analytics/collection-growth:
 *   get:
 *     summary: Get collection growth over time
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collection growth data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/collection-growth",
  authMiddleware,
  analyticsController.getCollectionGrowth,
);

/**
 * @openapi
 * /analytics/trade-performance:
 *   get:
 *     summary: Get trade performance metrics (profit/loss)
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trade performance retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/trade-performance",
  authMiddleware,
  analyticsController.getTradePerformance,
);

module.exports = router;
