const { sendSuccessResponse } = require("../../common/utils/response");
const { createPriceHistorySchema } = require("./price-history.schema");
const priceHistoryService = require("./price-history.service");

async function createPriceHistory(request, response, next) {
  try {
    const payload = createPriceHistorySchema.parse(request.body);

    const priceHistory = await priceHistoryService.createPriceHistory(
      request.user.id,
      payload,
    );

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "Price history entry created successfully",
      data: priceHistory,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPriceHistoryByItemId(request, response, next) {
  try {
    const itemId = Number(request.params.itemId);

    const priceHistory = await priceHistoryService.getPriceHistoryByItemId(
      request.user.id,
      itemId,
    );

    return sendSuccessResponse(response, {
      message: "Price history retrieved successfully",
      data: priceHistory,
    });
  } catch (error) {
    return next(error);
  }
}

async function deletePriceHistory(request, response, next) {
  try {
    const priceHistoryId = Number(request.params.priceHistoryId);

    await priceHistoryService.deletePriceHistory(
      request.user.id,
      priceHistoryId,
    );

    return sendSuccessResponse(response, {
      message: "Price history entry deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPriceHistory,
  getPriceHistoryByItemId,
  deletePriceHistory,
};