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
 *               - category
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
 *               trackingUrl:
 *                 type: string
 *                 format: uri
 *               store:
 *                 type: string
 *               isTrackingEnabled:
 *                 type: boolean
 *               trackingFrequencyHours:
 *                 type: integer
 *               currency:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *       400:
 *         description: Invalid request data
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 category:
 *                   type: string
 *                 description:
 *                   type: string
 *                   nullable: true
 *                 purchasePrice:
 *                   type: number
 *                   nullable: true
 *                 purchaseDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 currentEstimatedValue:
 *                   type: number
 *                   nullable: true
 *                 quantity:
 *                   type: integer
 *                 condition:
 *                   type: string
 *                   nullable: true
 *
 *                 trackingUrl:
 *                   type: string
 *                   format: uri
 *                   nullable: true
 *                   description: Product URL used for automatic value tracking
 *                 store:
 *                   type: string
 *                   nullable: true
 *                   description: Detected or assigned store (Amazon, Mercado Libre, etc.)
 *                 isTrackingEnabled:
 *                   type: boolean
 *                   description: Enables automatic value tracking
 *                 trackingFrequencyHours:
 *                   type: integer
 *                   description: Frequency in hours for tracking checks
 *                 currency:
 *                   type: string
 *                   description: Currency used for valuation (default MXN)
 *
 *                 lastCheckedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 nextCheckAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 lastPriceChangeAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *
 *                 consecutiveFailures:
 *                   type: integer
 *                 lastCheckStatus:
 *                   type: string
 *                   nullable: true
 *                   description: success | error | not_found | rate_limited | bot_protection
 *                 lastErrorMessage:
 *                   type: string
 *                   nullable: true
 *                 lastAvailability:
 *                   type: string
 *                   nullable: true
 *                   description: in_stock | out_of_stock | unknown
 *                 lastProviderSource:
 *                   type: string
 *                   nullable: true
 *                   description: Source used for scraping (e.g., amazon-playwright)
 *
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *
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
 *               trackingUrl:
 *                 type: string
 *                 format: uri
 *               store:
 *                 type: string
 *               isTrackingEnabled:
 *                 type: boolean
 *               trackingFrequencyHours:
 *                 type: integer
 *               currency:
 *                 type: string
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
 *         description: Invalid request data
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