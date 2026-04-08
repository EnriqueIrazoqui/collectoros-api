const express = require("express");

const authMiddleware = require("../../../middlewares/auth.middleware");
const wishlistAlertsController = require("./wishlistAlerts.controller");

const router = express.Router();

/**
 * @openapi
 * /alerts/wishlist:
 *   get:
 *     summary: Get wishlist alerts
 *     tags:
 *       - Alerts
 */
router.get(
  "/wishlist",
  authMiddleware,
  wishlistAlertsController.getWishlistAlerts,
);

/**
 * @openapi
 * /wishlist/{id}/read:
 *   patch:
 *     summary: Mark a wishlist alert as read
 *     tags:
 *       - Wishlist Alerts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Wishlist alert marked as read successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wishlist alert not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/wishlist/:id/read",
  authMiddleware,
  wishlistAlertsController.markWishlistAlertAsRead,
);

/**
 * @openapi
 * /wishlist/read-all:
 *   patch:
 *     summary: Mark all wishlist alerts as read
 *     tags:
 *       - Wishlist Alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All wishlist alerts marked as read successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/wishlist/read-all",
  authMiddleware,
  wishlistAlertsController.markAllWishlistAlertsAsRead,
);

/**
 * @openapi
 * /wishlist/unread-count:
 *   get:
 *     summary: Get unread wishlist alerts count
 *     tags:
 *       - Wishlist Alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread wishlist alerts count retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/wishlist/unread-count",
  authMiddleware,
  wishlistAlertsController.getWishlistAlertsUnreadCount,
);

module.exports = router;