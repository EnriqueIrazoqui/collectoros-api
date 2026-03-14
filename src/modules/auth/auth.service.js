const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const env = require("../../config/env");
const authRepository = require("./auth.repository");

async function registerUser(payload) {
    const existingUser = await authRepository.findUserByEmail(payload.email);

    if (existingUser) {
        const error = new Error("Email is alredy registered");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await authRepository.createUser({
        email: payload.email,
        passwordHash,
        displayName: payload.displayName,
    });

    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
    };
}

async function loginUser(payload) {
    const user = await authRepository.findUserByEmail(payload.email);

    if (!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
        const error = new Error("Invalid credentials");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
        },
        env.jwtSecret,
        {
            expiresIn: "1h",
        },
    );

    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        },
    };
}

async function getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
};
