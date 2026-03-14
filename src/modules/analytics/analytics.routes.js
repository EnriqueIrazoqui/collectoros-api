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
router.get(
  "/summary",
  authMiddleware,
  analyticsController.getAnalyticsSummary,
);

module.exports = router;