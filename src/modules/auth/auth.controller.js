const authService = require("./auth.service");
const {registerSchema, loginSchema} = require("./auth.schema");

async function register(request, response, next) {
    try {
        const payload = registerSchema.parse(request.body);
        const user = await authService.registerUser(payload);

        return response.status(201).json({
            ok: true,
            message: "User registered succesfully",
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

        return response.status(200).json({
            ok: true,
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

        return response.status(200).json({
            ok: true,
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
}