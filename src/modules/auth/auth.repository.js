const prisma = require("../../config/prisma");

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function findUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

async function createUser(data, db = prisma) {
  return db.user.create({
    data,
  });
}

async function updateUserRefreshToken(userId, data) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshTokenHash: data.refreshTokenHash,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    },
  });
}

async function clearUserRefreshToken(userId) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    },
  });
}

async function markWelcomeAsSeen(userId) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hasSeenWelcome: true,
      welcomeSeenAt: new Date(),
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRefreshToken,
  clearUserRefreshToken,
  markWelcomeAsSeen,
};
