const express = require("express");
const multer = require("multer");
const authMiddleware = require("../../middlewares/auth.middleware");
const inventoryController = require("./inventory.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * @openapi
 * /inventory:
 *   post:
 *     summary: Create a new inventory item with optional images
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               currentEstimatedValue:
 *                 type: number
 *               quantity:
 *                 type: number
 *               condition:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  inventoryController.createInventoryItem,
);

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
router.get(
  "/:inventoryItemId",
  authMiddleware,
  inventoryController.getInventoryItemById,
);

/**
 * @openapi
 * /inventory/images/{imageId}/content:
 *   get:
 *     summary: Get image content by image id (stream)
 *     tags:
 *       - Inventory Images
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image content stream
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *       502:
 *         description: Error accessing OneDrive
 */
router.get(
  "/images/:imageId/content",
  authMiddleware,
  inventoryController.getInventoryImageContent
);

/**
 * @openapi
 * /inventory/{inventoryItemId}/images:
 *   get:
 *     summary: Get all images for an inventory item
 *     tags:
 *       - Inventory Images
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
 *         description: Images retrieved successfully
 *       404:
 *         description: Inventory item not found
 */
router.get(
  "/:inventoryItemId/images",
  authMiddleware,
  inventoryController.getInventoryItemImages,
);

/**
 * @openapi
 * /inventory/{inventoryItemId}:
 *   patch:
 *     summary: Update an inventory item and optionally upload new images
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
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               currentEstimatedValue:
 *                 type: number
 *               condition:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               hasChanges:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       400:
 *         description: No changes detected
 *       404:
 *         description: Inventory item not found
 */
router.patch(
  "/:id",
  authMiddleware,
  upload.array("images", 5), 
  inventoryController.updateInventoryItem
);

/**
 * @openapi
 * /inventory/{inventoryItemId}:
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
router.delete(
  "/:inventoryItemId",
  authMiddleware,
  inventoryController.deleteInventoryItem,
);

module.exports = router;