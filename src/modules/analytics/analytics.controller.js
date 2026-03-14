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

module.exports = {
  getAnalyticsSummary,
};