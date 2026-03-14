const prisma = require("../../config/prisma");

async function createPriceHistory(data) {
  return prisma.priceHistory.create({
    data,
  });
}

async function findPriceHistoryByItemId(itemId) {
  return prisma.priceHistory.findMany({
    where: {
      itemId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findPriceHistoryById(priceHistoryId) {
  return prisma.priceHistory.findUnique({
    where: {
      id: priceHistoryId,
    },
  });
}

async function deletePriceHistory(priceHistoryId) {
  return prisma.priceHistory.delete({
    where: {
      id: priceHistoryId,
    },
  });
}

module.exports = {
  createPriceHistory,
  findPriceHistoryByItemId,
  findPriceHistoryById,
  deletePriceHistory,
};