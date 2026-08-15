const authService = require("./auth.service");
const { sendSuccessResponse } = require("../../common/utils/response");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  acceptInvitationSchema,
} = require("./auth.schema");

async function register(request, response, next) {
  try {
    const payload = registerSchema.parse(request.body);
    const user = await authService.registerUser(payload);

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function acceptInvitation(request, response, next) {
  try {
    const payload = acceptInvitationSchema.parse(request.body);

    const user = await authService.acceptInvitation(payload);

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "Invitation accepted successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await authService.loginUser(payload);

    return sendSuccessResponse(response, {
      statusCode: 200,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function refresh(request, response, next) {
  try {
    const payload = refreshSchema.parse(request.body);
    const result = await authService.refreshUserSession(payload.refreshToken);

    return sendSuccessResponse(response, {
      statusCode: 200,
      message: "Session refreshed successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(request, response, next) {
  try {
    await authService.logoutUser(request.user.id);

    return sendSuccessResponse(response, {
      statusCode: 200,
      message: "Logout successful",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function me(request, response, next) {
  try {
    const user = await authService.getCurrentUser(request.user.id);

    return sendSuccessResponse(response, {
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function markWelcomeSeen(request, response, next) {
  try {
    const result = await authService.markWelcomeAsSeen(request.user.id);

    return sendSuccessResponse(response, {
      statusCode: 200,
      message: "Welcome marked as seen successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  acceptInvitation,
  login,
  refresh,
  logout,
  me,
  markWelcomeSeen,
};
