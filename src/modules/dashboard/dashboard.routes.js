const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: Get aggregated dashboard data for the authenticated user
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 */
router.get("/", authMiddleware, dashboardController.getDashboard);

module.exports = router;