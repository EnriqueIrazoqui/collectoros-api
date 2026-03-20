const { sendSuccessResponse } = require("../../common/utils/response");
const inventoryService = require("./inventory.service");
const {
  createInventoryItemSchema,
  updateInventoryItemSchema,
} = require("./inventory.schema");

async function createInventoryItem(request, response, next) {
  try {
    console.log("BODY:", request.body);
    console.log("FILES:", request.files);

    const payload = createInventoryItemSchema.parse(request.body);

    const inventoryItem = await inventoryService.createInventoryItem(
      request.user.id,
      payload,
      request.files || [],
    );

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "Inventory item created successfully",
      data: inventoryItem,
    });
  } catch (error) {
    return next(error);
  }
}

async function getInventoryItems(request, response, next) {
  try {
    const inventoryItems = await inventoryService.getInventoryItems(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "Inventory items retrieved successfully",
      data: inventoryItems,
    });
  } catch (error) {
    return next(error);
  }
}

async function getInventoryItemById(request, response, next) {
  try {
    const inventoryItemId = Number(request.params.inventoryItemId);

    const inventoryItem = await inventoryService.getInventoryItemById(
      request.user.id,
      inventoryItemId,
    );

    return sendSuccessResponse(response, {
      message: "Inventory item retrieved successfully",
      data: inventoryItem,
    });
  } catch (error) {
    return next(error);
  }
}

const getInventoryImageContent = async (request, response, next) => {
  try {
    const userId = request.user.id;
    const imageId = Number(request.params.imageId);

    const result = await inventoryService.getInventoryImageContent({
      userId,
      imageId,
    });

    response.setHeader("Content-Type", result.contentType || "application/octet-stream");
    response.setHeader(
      "Content-Disposition",
      `inline; filename="${result.fileName || "image"}"`
    );

    if (result.contentLength) {
      response.setHeader("Content-Length", String(result.contentLength));
    }

    result.stream.pipe(response);
  } catch (error) {
    next(error);
  }
};

async function getInventoryItemImages(request, response, next) {
  try {
    const inventoryItemId = Number(request.params.inventoryItemId);

    const images = await inventoryService.getInventoryItemImages(
      request.user.id,
      inventoryItemId,
    );

    return sendSuccessResponse(response, {
      message: "Inventory item images retrieved successfully",
      data: images,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateInventoryItem(request, response, next) {
  try {
    const inventoryItemId = Number(request.params.id);
    const payload = updateInventoryItemSchema.parse(request.body);
    const files = request.files || [];

    const inventoryItem = await inventoryService.updateInventoryItem(
      request.user.id,
      inventoryItemId,
      payload,
      files,
    );

    return sendSuccessResponse(response, {
      message: "Inventory item updated successfully",
      data: inventoryItem,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteInventoryItem(request, response, next) {
  try {
    const inventoryItemId = Number(request.params.inventoryItemId);

    await inventoryService.deleteInventoryItem(request.user.id, inventoryItemId);

    return sendSuccessResponse(response, {
      message: "Inventory item deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  getInventoryImageContent,
  getInventoryItemImages,
  updateInventoryItem,
  deleteInventoryItem,
};