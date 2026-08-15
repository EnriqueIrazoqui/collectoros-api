const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const env = require("../../config/env");
const authRepository = require("./auth.repository");
const AppError = require("../../common/errors/app-error");

const accessRequestRepository = require(
  "../access-request/access-request.repository",
);

const prisma = require("../../config/prisma");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh",
    },
    env.jwtSecret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  );
}

async function registerUser(payload) {
  const existingUser = await authRepository.findUserByEmail(payload.email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
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

async function acceptInvitation(payload) {
  const invitationTokenHash = crypto
    .createHash("sha256")
    .update(payload.token)
    .digest("hex");

  const accessRequest =
    await accessRequestRepository.findAccessRequestByInvitationTokenHash(
      invitationTokenHash,
    );

  if (!accessRequest) {
    throw new AppError("Invalid invitation token", 400);
  }

  if (accessRequest.status !== "approved") {
    throw new AppError(
      "This access request has not been approved",
      403,
    );
  }

  if (accessRequest.invitationAcceptedAt) {
    throw new AppError(
      "This invitation has already been used",
      409,
    );
  }

  if (
    !accessRequest.invitationExpiresAt ||
    accessRequest.invitationExpiresAt < new Date()
  ) {
    throw new AppError(
      "This invitation has expired",
      410,
    );
  }

  const existingUser = await authRepository.findUserByEmail(
    accessRequest.email,
  );

  if (existingUser) {
    throw new AppError(
      "Email is already registered",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    10,
  );

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await authRepository.createUser(
      {
        email: accessRequest.email,
        passwordHash,
        displayName: accessRequest.name,
      },
      tx,
    );

    await accessRequestRepository.updateAccessRequestStatus(
      accessRequest.id,
      {
        invitationAcceptedAt: new Date(),
        invitationTokenHash: null,
        invitationExpiresAt: null,
      },
      tx,
    );

    return createdUser;
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
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account is inactive", 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  const refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS,
  );

  await authRepository.updateUserRefreshToken(user.id, {
    refreshTokenHash,
    refreshTokenExpiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
    },
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(refreshToken, env.jwtSecret);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  if (decodedToken.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await authRepository.findUserById(Number(decodedToken.sub));

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
    throw new AppError("Refresh session not found", 401);
  }

  if (new Date(user.refreshTokenExpiresAt) < new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  const isRefreshTokenValid = await bcrypt.compare(
    refreshToken,
    user.refreshTokenHash,
  );

  if (!isRefreshTokenValid) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  const newRefreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS,
  );

  await authRepository.updateUserRefreshToken(user.id, {
    refreshTokenHash: newRefreshTokenHash,
    refreshTokenExpiresAt: newRefreshTokenExpiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async function logoutUser(userId) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await authRepository.clearUserRefreshToken(userId);

  return null;
}

async function getCurrentUser(userId) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,

    hasSeenWelcome: user.hasSeenWelcome,
    welcomeSeenAt: user.welcomeSeenAt,

    microsoftAccountId: user.microsoftAccountId,
    microsoftConnected:
      !!user.microsoftAccessToken && !!user.microsoftRefreshToken,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function markWelcomeAsSeen(userId) {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.hasSeenWelcome) {
    return {
      hasSeenWelcome: true,
      welcomeSeenAt: user.welcomeSeenAt,
    };
  }

  const updatedUser = await authRepository.markWelcomeAsSeen(userId);

  return {
    hasSeenWelcome: updatedUser.hasSeenWelcome,
    welcomeSeenAt: updatedUser.welcomeSeenAt,
  };
}

module.exports = {
  registerUser,
  acceptInvitation,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshUserSession,
  markWelcomeAsSeen,
};
