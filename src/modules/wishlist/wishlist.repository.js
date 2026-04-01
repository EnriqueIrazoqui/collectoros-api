const prisma = require("../../config/prisma");

async function createWishlistItem(data) {
  return prisma.wishlistItem.create({
    data,
  });
}

async function findWishlistItemsByUserId(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "all",
    priority = "all",
    sortBy = "createdAt-desc",
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
    ...(priority !== "all" ? { priority } : {}),
  };

  let orderBy = { createdAt: "desc" };

  switch (sortBy) {
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "targetPrice-desc":
      orderBy = { targetPrice: "desc" };
      break;
    case "targetPrice-asc":
      orderBy = { targetPrice: "asc" };
      break;
    case "observedPrice-desc":
      orderBy = { currentObservedPrice: "desc" };
      break;
    case "observedPrice-asc":
      orderBy = { currentObservedPrice: "asc" };
      break;
    case "createdAt-desc":
      orderBy = { createdAt: "desc" };
      break;
    case "createdAt-asc":
      orderBy = { createdAt: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const [total, items] = await Promise.all([
    prisma.wishlistItem.count({ where }),
    prisma.wishlistItem.findMany({
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

async function findWishlistItemById(wishlistItemId) {
  return prisma.wishlistItem.findUnique({
    where: {
      id: wishlistItemId,
    },
  });
}

async function updateWishlistItem(wishlistItemId, data) {
  return prisma.wishlistItem.update({
    where: {
      id: wishlistItemId,
    },
    data,
  });
}

async function deleteWishlistItem(wishlistItemId) {
  return prisma.wishlistItem.delete({
    where: {
      id: wishlistItemId,
    },
  });
}

module.exports = {
  createWishlistItem,
  findWishlistItemsByUserId,
  findWishlistItemById,
  updateWishlistItem,
  deleteWishlistItem,
};
