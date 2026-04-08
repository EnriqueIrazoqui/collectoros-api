const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const wishlistController = require("./wishlist.controller");

const router = express.Router();

/**
 * @openapi
 * /wishlist:
 *   post:
 *     summary: Create a new wishlist item
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Wishlist item created successfully
 *   get:
 *     summary: Get all wishlist items for the authenticated user
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items retrieved successfully
 */
router.post("/", authMiddleware, wishlistController.createWishlistItem);
router.get("/", authMiddleware, wishlistController.getWishlistItems);

/**
 * @openapi
 * /wishlist/{wishlistItemId}:
 *   get:
 *     summary: Get a wishlist item by id
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist item retrieved successfully
 *       404:
 *         description: Wishlist item not found
 *   patch:
 *     summary: Update a wishlist item by id
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist item updated successfully
 *       404:
 *         description: Wishlist item not found
 *   delete:
 *     summary: Delete a wishlist item by id
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist item deleted successfully
 *       404:
 *         description: Wishlist item not found
 */
router.get(
  "/:wishlistItemId",
  authMiddleware,
  wishlistController.getWishlistItemById,
);

/**
 * @openapi
 * /wishlist/{wishlistItemId}:
 *   patch:
 *     summary: Update a wishlist item by id
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist item updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist item not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:wishlistItemId",
  authMiddleware,
  wishlistController.updateWishlistItem,
);

/**
 * @openapi
 * /wishlist/{wishlistItemId}:
 *   delete:
 *     summary: Delete a wishlist item by id
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wishlistItemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist item not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:wishlistItemId",
  authMiddleware,
  wishlistController.deleteWishlistItem,
);

module.exports = router;
