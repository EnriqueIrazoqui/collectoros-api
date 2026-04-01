function sendSuccessResponse(response, options = {}) {
  const {
    statusCode = 200,
    message = "Request successful",
    data = null,
    warnings = [],
    pagination = null,
  } = options;

  return response.status(statusCode).json({
    ok: true,
    message,
    data,
    ...(pagination && { pagination }),
    ...(warnings.length > 0 && { warnings }),
  });
}

module.exports = {
  sendSuccessResponse,
};