const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const forecastController = require("./forecast.controller");

const router = express.Router();

/**
 * @openapi
 * /forecast/{itemId}:
 *   get:
 *     summary: Get forecast projection for an inventory item
 *     tags:
 *       - Forecast
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
 *         description: Forecast retrieved successfully
 *       404:
 *         description: Inventory item not found
 */
router.get("/:itemId", authMiddleware, forecastController.getForecastByItemId);

module.exports = router;