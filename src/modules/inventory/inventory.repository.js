const prisma = require("../../config/prisma");

async function createInventoryItem(data) {
  return prisma.inventoryItem.create({
    data,
  });
}

async function createInventoryItemImages(data) {
  return prisma.inventoryItemImage.createMany({
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

async function findInventoryItemByIdAndUserId(inventoryItemId, userId) {
  return prisma.inventoryItem.findFirst({
    where: {
      id: inventoryItemId,
      userId,
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

async function findInventoryImagesByItemIdAndUserId(inventoryItemId, userId) {
  return prisma.inventoryItemImage.findMany({
    where: {
      inventoryItemId,
      userId,
    },
    orderBy: {
      position: "asc",
    },
  });
}

async function countInventoryItemImages(inventoryItemId) {
  return prisma.inventoryItemImage.count({
    where: {
      inventoryItemId,
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

async function deleteInventoryItemImagesByItemId(inventoryItemId) {
  return prisma.inventoryItemImage.deleteMany({
    where: {
      inventoryItemId,
    },
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
  createInventoryItemImages,
  findInventoryItemsByUserId,
  findInventoryItemById,
  findInventoryItemByIdAndUserId,
  countInventoryItemImages,
  updateInventoryItem,
  deleteInventoryItemImagesByItemId,
  deleteInventoryItem,
  findInventoryImagesByItemIdAndUserId,
};