const {ZodError} = require("zod");

function errorMiddleware(error, request, response, next) {
  console.error(error);

  if (error instanceof ZodError) {
    return response.status(400).json({
      ok: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error.statusCode) {
    return response.status(error.statusCode).json({
      ok: false,
      message: error.message,
    });
  }

  return response.status(500).json({
    ok: false,
    message: "Internal server error",
  });
}

module.exports = errorMiddleware