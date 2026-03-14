const { sendSuccessResponse } = require("../../common/utils/response");
const dashboardService = require("./dashboard.service");

async function getDashboard(request, response, next) {
  try {
    const dashboard = await dashboardService.getDashboard(request.user.id);

    return sendSuccessResponse(response, {
      message: "Dashboard retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
};