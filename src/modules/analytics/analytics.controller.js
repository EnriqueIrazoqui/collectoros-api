const { sendSuccessResponse } = require("../../common/utils/response");
const analyticsService = require("./analytics.service");

async function getAnalyticsSummary(request, response, next) {
  try {
    const summary = await analyticsService.getAnalyticsSummary(request.user.id);

    return sendSuccessResponse(response, {
      message: "Analytics summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPortfolioAnalytics(request, response, next) {
  try {
    const portfolio = await analyticsService.getPortfolioAnalytics(request.user.id);

    return sendSuccessResponse(response, {
      message: "Portfolio analytics retrieved successfully",
      data: portfolio,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTopItems(request, response, next) {
  try {
    const topItems = await analyticsService.getTopItems(request.user.id);

    return sendSuccessResponse(response, {
      message: "Top items retrieved successfully",
      data: topItems,
    });
  } catch (error) {
    return next(error);
  }
}

async function getItemTrend(request, response, next) {
  try {
    const itemId = Number(request.params.itemId);

    const trend = await analyticsService.getItemTrend(
      request.user.id,
      itemId,
    );

    return sendSuccessResponse(response, {
      message: "Item trend retrieved successfully",
      data: trend,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnalyticsSummary,
  getPortfolioAnalytics,
  getTopItems,
  getItemTrend,
};