const authService = require("./auth.service");
const { registerSchema, loginSchema } = require("./auth.schema");
const { sendSuccessResponse } = require("../../common/utils/response");

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

module.exports = {
  register,
  login,
  me,
};
