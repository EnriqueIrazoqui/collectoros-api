const prisma = require("../../config/prisma");
const { getWishlistItemStatus } = require("./utils/wishlistStatus.helper");

async function countWishlistItemsByUserId(userId) {
  return prisma.wishlistItem.count({
    where: {
      userId,
    },
  });
}

async function createWishlistItem(data) {
  return prisma.wishlistItem.create({
    data,
  });
}

function applySort(items, sortBy) {
  const sortedItems = [...items];

  switch (sortBy) {
    case "name-asc":
      sortedItems.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
      break;

    case "name-desc":
      sortedItems.sort((a, b) =>
        String(b.name || "").localeCompare(String(a.name || "")),
      );
      break;

    case "targetPrice-desc":
      sortedItems.sort(
        (a, b) => Number(b.targetPrice || 0) - Number(a.targetPrice || 0),
      );
      break;

    case "targetPrice-asc":
      sortedItems.sort(
        (a, b) => Number(a.targetPrice || 0) - Number(b.targetPrice || 0),
      );
      break;

    case "observedPrice-desc":
      sortedItems.sort(
        (a, b) =>
          Number(b.currentObservedPrice || 0) -
          Number(a.currentObservedPrice || 0),
      );
      break;

    case "observedPrice-asc":
      sortedItems.sort(
        (a, b) =>
          Number(a.currentObservedPrice || 0) -
          Number(b.currentObservedPrice || 0),
      );
      break;

    case "delta-desc":
      sortedItems.sort((a, b) => {
        const deltaA =
          Number(a.currentObservedPrice || 0) - Number(a.targetPrice || 0);
        const deltaB =
          Number(b.currentObservedPrice || 0) - Number(b.targetPrice || 0);

        return deltaA - deltaB;
      });
      break;

    case "delta-asc":
      sortedItems.sort((a, b) => {
        const deltaA =
          Number(a.currentObservedPrice || 0) - Number(a.targetPrice || 0);
        const deltaB =
          Number(b.currentObservedPrice || 0) - Number(b.targetPrice || 0);

        return deltaB - deltaA;
      });
      break;

    case "createdAt-asc":
      sortedItems.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;

    case "createdAt-desc":
    default:
      sortedItems.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }

  return sortedItems;
}

async function findWishlistItemsByUserId(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "all",
    priority = "all",
    status = "all",
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
            {
              description: {
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

  const [items, alerts] = await Promise.all([
    prisma.wishlistItem.findMany({
      where,
    }),
    prisma.wishlistAlert.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        wishlistItemId: true,
        type: true,
        status: true,
        triggeredAt: true,
      },
      orderBy: {
        triggeredAt: "desc",
      },
    }),
  ]);

  const enrichedItems = items.map((item) => {
    const derivedStatus = getWishlistItemStatus(item, alerts);

    return {
      ...item,
      derivedStatus,
    };
  });

  const filteredItems =
    status === "all"
      ? enrichedItems
      : enrichedItems.filter(
          (item) =>
            String(item.derivedStatus || "").toLowerCase() ===
            String(status).toLowerCase(),
        );

  const sortedItems = applySort(filteredItems, sortBy);
  const paginatedItems = sortedItems.slice(skip, skip + safeLimit);

  return {
    items: paginatedItems,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: sortedItems.length,
      totalPages: Math.ceil(sortedItems.length / safeLimit),
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
  countWishlistItemsByUserId,
  findWishlistItemsByUserId,
  findWishlistItemById,
  updateWishlistItem,
  deleteWishlistItem,
};
