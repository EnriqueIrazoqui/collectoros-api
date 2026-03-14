const prisma = require("../../config/prisma");

async function createInventoryItem(data) {
  return prisma.inventoryItem.create({
    data,
  });
}

async function findInventoryItemsByUserId(userId) {
  return prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findInventoryItemById(inventoryItemId) {
  return prisma.inventoryItem.findUnique({
    where: {
      id: inventoryItemId,
    },
  });
}

async function updateInventoryItem(inventoryItemId, data) {
  return prisma.inventoryItem.update({
    where: {
      id: inventoryItemId,
    },
    data,
  });
}

async function deleteInventoryItem(inventoryItemId) {
  return prisma.inventoryItem.delete({
    where: {
      id: inventoryItemId,
    },
  });
}

module.exports = {
  createInventoryItem,
  findInventoryItemsByUserId,
  findInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
};