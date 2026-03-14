const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const priceHistoryController = require("./price-history.controller");

const router = express.Router();

/**
 * @openapi
 * /price-history:
 *   post:
 *     summary: Create a new price history entry
 *     tags:
 *       - Price History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Price history entry created successfully
 */
router.post("/", authMiddleware, priceHistoryController.createPriceHistory);

/**
 * @openapi
 * /price-history/{itemId}:
 *   get:
 *     summary: Get price history for an inventory item
 *     tags:
 *       - Price History
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
 *         description: Price history retrieved successfully
 *       404:
 *         description: Inventory item not found
 */
router.get("/:itemId", authMiddleware, priceHistoryController.getPriceHistoryByItemId);

/**
 * @openapi
 * /price-history/entry/{priceHistoryId}:
 *   delete:
 *     summary: Delete a price history entry
 *     tags:
 *       - Price History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: priceHistoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Price history entry deleted successfully
 *       404:
 *         description: Price history entry not found
 */
router.delete(
  "/entry/:priceHistoryId",
  authMiddleware,
  priceHistoryController.deletePriceHistory,
);

module.exports = router;