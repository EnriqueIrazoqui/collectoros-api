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

router.patch(
  "/wishlist/:id/read",
  authMiddleware,
  wishlistAlertsController.markWishlistAlertAsRead,
);

router.patch(
  "/wishlist/read-all",
  authMiddleware,
  wishlistAlertsController.markAllWishlistAlertsAsRead,
);

router.get(
  "/wishlist/unread-count",
  authMiddleware,
  wishlistAlertsController.getWishlistAlertsUnreadCount,
);

module.exports = router;