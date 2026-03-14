const { sendSuccessResponse } = require("../../common/utils/response");
const forecastService = require("./forecast.service");

async function getForecastByItemId(request, response, next) {
  try {
    const itemId = Number(request.params.itemId);

    const forecast = await forecastService.getForecastByItemId(
      request.user.id,
      itemId,
    );

    return sendSuccessResponse(response, {
      message: "Forecast retrieved successfully",
      data: forecast,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getForecastByItemId,
};