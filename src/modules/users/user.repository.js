const prisma = require("../../config/prisma");

async function updateMicrosoftTokens(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

async function findUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}


module.exports = {
  updateMicrosoftTokens,
  findUserById,
};