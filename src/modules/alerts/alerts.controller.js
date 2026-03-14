const { sendSuccessResponse } = require("../../common/utils/response");
const alertsService = require("./alerts.service");

async function getWishlistOpportunities(request, response, next) {
  try {
    const opportunities = await alertsService.getWishlistOpportunities(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "Wishlist opportunities retrieved successfully",
      data: opportunities,
    });
  } catch (error) {
    return next(error);
  }
}

async function getInventoryMovers(request, response, next) {
  try {
    const movers = await alertsService.getInventoryMovers(request.user.id);

    return sendSuccessResponse(response, {
      message: "Inventory movers retrieved successfully",
      data: movers,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWishlistOpportunities,
  getInventoryMovers,
};