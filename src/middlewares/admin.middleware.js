function adminMiddleware(request, response, next) {
  try {
    if (!request.user) {
      return response.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    if (request.user.role !== "admin") {
      return response.status(403).json({
        ok: false,
        message: "Access denied. Admins only.",
      });
    }

    return next();
  } catch (error) {
    return response.status(500).json({
      ok: false,
      message: "Error validating admin permissions",
    });
  }
}

module.exports = adminMiddleware;