function sendSuccessResponse(response, options = {}) {
  const {
    statusCode = 200,
    message = "Request successful",
    data = null,
  } = options;

  return response.status(statusCode).json({
    ok: true,
    message,
    data,
  });
}

module.exports = {
  sendSuccessResponse,
};