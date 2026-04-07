const { sendSuccessResponse } = require("../../common/utils/response");
const wishlistService = require("./wishlist.service");
const {
  createWishlistItemSchema,
  updateWishlistItemSchema,
} = require("./wishlist.schema");

async function createWishlistItem(request, response, next) {
  try {
    const payload = createWishlistItemSchema.parse(request.body);

    const wishlistItem = await wishlistService.createWishlistItem(
      request.user.id,
      payload,
    );

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "Wishlist item created successfully",
      data: wishlistItem,
    });
  } catch (error) {
    return next(error);
  }
}

async function getWishlistItems(request, response, next) {
  try {
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 10;
    const search = request.query.search || "";
    const category = request.query.category || "all";
    const priority = request.query.priority || "all";
    const status = request.query.status || "all";
    const sortBy = request.query.sortBy || "createdAt-desc";

    const result = await wishlistService.getWishlistItems(request.user.id, {
      page,
      limit,
      search,
      category,
      priority,
      status,
      sortBy,
    });

    return sendSuccessResponse(response, {
      message: "Wishlist items retrieved successfully",
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

async function getWishlistItemById(request, response, next) {
  try {
    const wishlistItemId = Number(request.params.wishlistItemId);

    const wishlistItem = await wishlistService.getWishlistItemById(
      request.user.id,
      wishlistItemId,
    );

    return sendSuccessResponse(response, {
      message: "Wishlist item retrieved successfully",
      data: wishlistItem,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateWishlistItem(request, response, next) {
  try {
    const wishlistItemId = Number(request.params.wishlistItemId);
    const payload = updateWishlistItemSchema.parse(request.body);

    const wishlistItem = await wishlistService.updateWishlistItem(
      request.user.id,
      wishlistItemId,
      payload,
    );

    return sendSuccessResponse(response, {
      message: "Wishlist item updated successfully",
      data: wishlistItem,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteWishlistItem(request, response, next) {
  try {
    const wishlistItemId = Number(request.params.wishlistItemId);

    await wishlistService.deleteWishlistItem(request.user.id, wishlistItemId);

    return sendSuccessResponse(response, {
      message: "Wishlist item deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createWishlistItem,
  getWishlistItems,
  getWishlistItemById,
  updateWishlistItem,
  deleteWishlistItem,
};
