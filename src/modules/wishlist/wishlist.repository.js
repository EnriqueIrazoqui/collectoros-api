const prisma = require("../../config/prisma");

async function createWishlistItem(data) {
  return prisma.wishlistItem.create({
    data,
  });
}

async function findWishlistItemsByUserId(userId) {
  return prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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