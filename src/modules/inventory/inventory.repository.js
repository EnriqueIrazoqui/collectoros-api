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

async function findInventoryItemsByUserId(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "all",
    sortBy = "purchaseDate-desc",
  } = options;

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 100) : 10;
  const skip = (safePage - 1) * safeLimit;

  const where = {
    userId,
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(category !== "all" ? { category } : {}),
  };

  let orderBy = { createdAt: "desc" };

  switch (sortBy) {
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "purchasePrice-desc":
      orderBy = { purchasePrice: "desc" };
      break;
    case "purchasePrice-asc":
      orderBy = { purchasePrice: "asc" };
      break;
    case "estimatedValue-desc":
      orderBy = { currentEstimatedValue: "desc" };
      break;
    case "estimatedValue-asc":
      orderBy = { currentEstimatedValue: "asc" };
      break;
    case "purchaseDate-desc":
      orderBy = { purchaseDate: "desc" };
      break;
    case "purchaseDate-asc":
      orderBy = { purchaseDate: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [total, items] = await Promise.all([
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      orderBy,
      skip,
      take: safeLimit,
    }),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
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
