const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const inventoryController = require("./inventory.controller");

const router = express.Router();

/**
 * @openapi
 * /inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *   get:
 *     summary: Get all inventory items for the authenticated user
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 */
router.post("/", authMiddleware, inventoryController.createInventoryItem);
router.get("/", authMiddleware, inventoryController.getInventoryItems);

/**
 * @openapi
 * /inventory/{inventoryItemId}:
 *   get:
 *     summary: Get an inventory item by id
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory item retrieved successfully
 *       404:
 *         description: Inventory item not found
 *   patch:
 *     summary: Update an inventory item by id
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Inventory item not found
 *   delete:
 *     summary: Delete an inventory item by id
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 */
router.get("/:inventoryItemId", authMiddleware, inventoryController.getInventoryItemById);
router.patch("/:inventoryItemId", authMiddleware, inventoryController.updateInventoryItem);
router.delete("/:inventoryItemId", authMiddleware, inventoryController.deleteInventoryItem);

module.exports = router;