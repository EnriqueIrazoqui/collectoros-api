const prisma = require("../../config/prisma");

async function getHealth(request, response, next) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return response.status(200).json({
      ok: true,
      message: "CollectorOS API and database are running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHealth,
};