const jwt = require("jsonwebtoken");
const env = require("../config/env");

async function authMiddleware(request, response, next) {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(401).json({
        ok: false,
        message: "Authorization header is required",
      });
    }

    const [schema, token] = authorizationHeader.split(" ");

    if (schema !== "Bearer" || !token) {
      return response.status(401).json({
        ok: false,
        message: "Invalid authorization format",
      });
    }

    const payload = jwt.verify(token, env.jwtSecret);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (error) {
    return response.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;