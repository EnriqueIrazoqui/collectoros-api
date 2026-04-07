const { sendSuccessResponse } = require("../../../common/utils/response");
const wishlistAlertsService = require("./wishlistAlerts.service");

async function getWishlistAlerts(request, response, next) {
  try {
    const alerts = await wishlistAlertsService.getWishlistAlerts(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "Wishlist alerts retrieved successfully",
      data: alerts,
    });
  } catch (error) {
    return next(error);
  }
}

async function markWishlistAlertAsRead(request, response, next) {
  try {
    const { id } = request.params;

    await wishlistAlertsService.markWishlistAlertAsRead(
      request.user.id,
      Number(id),
    );

    return sendSuccessResponse(response, {
      message: "Wishlist alert marked as read",
    });
  } catch (error) {
    return next(error);
  }
}

async function markAllWishlistAlertsAsRead(request, response, next) {
  try {
    await wishlistAlertsService.markAllWishlistAlertsAsRead(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "All wishlist alerts marked as read",
    });
  } catch (error) {
    return next(error);
  }
}

async function getWishlistAlertsUnreadCount(request, response, next) {
  try {
    const count =
      await wishlistAlertsService.getWishlistAlertsUnreadCount(
        request.user.id,
      );

    return sendSuccessResponse(response, {
      message: "Unread alerts count retrieved",
      data: count,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWishlistAlerts,
  markWishlistAlertAsRead,
  markAllWishlistAlertsAsRead,
  getWishlistAlertsUnreadCount,
};