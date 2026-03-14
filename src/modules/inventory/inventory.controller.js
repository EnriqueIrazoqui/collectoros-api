const { sendSuccessResponse } = require("../../common/utils/response");
const inventoryService = require("./inventory.service");
const {
  createInventoryItemSchema,
  updateInventoryItemSchema,
} = require("./inventory.schema");

async function createInventoryItem(request, response, next) {
  try {
    const payload = createInventoryItemSchema.parse(request.body);

    const inventoryItem = await inventoryService.createInventoryItem(
      request.user.id,
      payload,
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
    const inventoryItems = await inventoryService.getInventoryItems(request.user.id);

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

async function updateInventoryItem(request, response, next) {
  try {
    const inventoryItemId = Number(request.params.inventoryItemId);
    const payload = updateInventoryItemSchema.parse(request.body);

    const inventoryItem = await inventoryService.updateInventoryItem(
      request.user.id,
      inventoryItemId,
      payload,
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
  updateInventoryItem,
  deleteInventoryItem,
};