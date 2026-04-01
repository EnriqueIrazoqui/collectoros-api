const AppError = require("../../common/errors/app-error");
const wishlistRepository = require("./wishlist.repository");

async function createWishlistItem(userId, payload) {
  return wishlistRepository.createWishlistItem({
    userId,
    ...payload,
  });
}

async function getWishlistItems(userId, options) {
  return wishlistRepository.findWishlistItemsByUserId(userId, options);
}

async function getWishlistItemById(userId, wishlistItemId) {
  const wishlistItem = await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  if (wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  return wishlistItem;
}

async function updateWishlistItem(userId, wishlistItemId, payload) {
  const wishlistItem = await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  if (wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  return wishlistRepository.updateWishlistItem(wishlistItemId, payload);
}

async function deleteWishlistItem(userId, wishlistItemId) {
  const wishlistItem = await wishlistRepository.findWishlistItemById(wishlistItemId);

  if (!wishlistItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  if (wishlistItem.userId !== userId) {
    throw new AppError("Wishlist item not found", 404);
  }

  await wishlistRepository.deleteWishlistItem(wishlistItemId);

  return null;
}

module.exports = {
  createWishlistItem,
  getWishlistItems,
  getWishlistItemById,
  updateWishlistItem,
  deleteWishlistItem,
};