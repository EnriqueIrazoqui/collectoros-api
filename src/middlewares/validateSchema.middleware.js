function validateSchema(schema) {
  return (request, response, next) => {
    try {
      request.body = schema.parse(request.body);
      return next();
    } catch (error) {
      return response.status(400).json({
        ok: false,
        message: "Validation error",
        errors: error.issues?.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
  };
}

module.exports = validateSchema;