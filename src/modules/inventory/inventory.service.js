const AppError = require("../../common/errors/app-error");
const inventoryRepository = require("./inventory.repository");
const oneDriveService = require("../../services/oneDrive.service");
const inventoryTrackingQueue = require("../../jobs/queues/inventoryTrackingQueue");
const prisma = require("../../config/prisma");

const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_INVENTORY_ITEMS_PER_USER = 250;

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toBooleanOrDefault(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return defaultValue;
}

function normalizeInventoryPayload(payload) {
  return {
    ...payload,
    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null,
    purchasePrice: toNumberOrNull(payload.purchasePrice),
    currentEstimatedValue: toNumberOrNull(payload.currentEstimatedValue),
    quantity: toNumberOrNull(payload.quantity) ?? 1,

    trackingUrl: toTrimmedStringOrNull(payload.trackingUrl),
    store: toTrimmedStringOrNull(payload.store),
    isTrackingEnabled: toBooleanOrDefault(payload.isTrackingEnabled, false),
    trackingFrequencyHours:
      toNumberOrNull(payload.trackingFrequencyHours) ?? 24,
    currency: toTrimmedStringOrNull(payload.currency) || "MXN",
  };
}

function toTrimmedStringOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function validateInventoryImages(files = []) {
  if (files.length > MAX_IMAGES) {
    throw new AppError("You can upload up to 5 images per item.", 400);
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type for "${file.originalname}". Only JPG, PNG, and WEBP are allowed.`,
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `The image "${file.originalname}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
        400,
      );
    }
  }
}

async function createInventoryItem(userId, payload, files = []) {
  validateInventoryImages(files);

  const normalizedPayload = normalizeInventoryPayload(payload);

  const currentInventoryItemsCount =
    await inventoryRepository.countInventoryItemsByUserId(userId);

  if (currentInventoryItemsCount >= MAX_INVENTORY_ITEMS_PER_USER) {
    throw new AppError(
      "You’ve reached your inventory limit of 250 items. Remove some items to add new ones.",
      400,
    );
  }

  const inventoryItem = await inventoryRepository.createInventoryItem({
    userId,
    ...normalizedPayload,
  });

  const warnings = [];

  if (files.length > 0) {
    const imagesToCreate = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const position = index + 1;

      try {
        const uploadResult = await oneDriveService.uploadInventoryImage({
          userId,
          itemId: inventoryItem.id,
          file,
          position,
        });

        imagesToCreate.push({
          inventoryItemId: inventoryItem.id,
          userId,
          imageUrl: uploadResult.imageUrl,
          driveItemId: uploadResult.driveItemId,
          fileName: uploadResult.fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          position,
        });
      } catch (error) {
        warnings.push({
          path: "images",
          message:
            error.message ||
            `The image "${file.originalname}" could not be uploaded.`,
        });
      }
    }

    if (imagesToCreate.length > 0) {
      await inventoryRepository.createInventoryItemImages(imagesToCreate);
    }
  }

  const item = await inventoryRepository.findInventoryItemByIdAndUserId(
    inventoryItem.id,
    userId,
  );

  if (item?.isTrackingEnabled && item?.trackingUrl && warnings.length === 0) {
    await inventoryTrackingQueue.add(
      "process-inventory-batch",
      {
        itemIds: [item.id],
        scheduledAt: new Date().toISOString(),
      },
      {
        jobId: `inventory-immediate-create:${item.id}:${Date.now()}`,
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    );
  }

  return {
    item,
    warnings,
  };
}

async function getInventoryItems(userId, options) {
  return inventoryRepository.findInventoryItemsByUserId(userId, options);
}

async function getInventoryItemById(userId, inventoryItemId) {
  const inventoryItem =
    await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  return inventoryItem;
}

async function getInventoryImageContent({ userId, imageId }) {
  const image = await prisma.inventoryItemImage.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });

  if (!image) {
    throw new AppError("Imagen no encontrada", 404);
  }

  if (!image.driveItemId) {
    throw new AppError("La imagen no tiene driveItemId", 400);
  }

  return oneDriveService.downloadFileByDriveItemId({
    userId,
    driveItemId: image.driveItemId,
    fileName: image.fileName,
  });
}

async function getInventoryItemImages(userId, inventoryItemId) {
  const inventoryItem =
    await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  return inventoryRepository.findInventoryImagesByItemIdAndUserId(
    inventoryItemId,
    userId,
  );
}

async function updateInventoryItem(
  userId,
  inventoryItemId,
  payload,
  files = [],
) {
  const inventoryItem =
    await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  if (files.length > 0) {
    const existingImages =
      await inventoryRepository.findInventoryImagesByItemIdAndUserId(
        inventoryItemId,
        userId,
      );

    const totalImages = existingImages.length + files.length;

    if (totalImages > MAX_IMAGES) {
      throw new AppError("Solo se permiten hasta 5 imágenes por item", 400);
    }

    validateInventoryImages(files);
  }

  const normalizedPayload = {
    ...payload,
  };

  if (Object.prototype.hasOwnProperty.call(payload, "purchaseDate")) {
    normalizedPayload.purchaseDate = payload.purchaseDate
      ? new Date(payload.purchaseDate)
      : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "purchasePrice")) {
    normalizedPayload.purchasePrice = toNumberOrNull(payload.purchasePrice);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "currentEstimatedValue")) {
    normalizedPayload.currentEstimatedValue = toNumberOrNull(
      payload.currentEstimatedValue,
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "quantity")) {
    normalizedPayload.quantity = toNumberOrNull(payload.quantity);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "trackingUrl")) {
    normalizedPayload.trackingUrl = toTrimmedStringOrNull(payload.trackingUrl);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "store")) {
    normalizedPayload.store = toTrimmedStringOrNull(payload.store);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "isTrackingEnabled")) {
    normalizedPayload.isTrackingEnabled = toBooleanOrDefault(
      payload.isTrackingEnabled,
      false,
    );
  }

  if (Object.prototype.hasOwnProperty.call(payload, "trackingFrequencyHours")) {
    normalizedPayload.trackingFrequencyHours =
      toNumberOrNull(payload.trackingFrequencyHours) ?? 24;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "currency")) {
    normalizedPayload.currency =
      toTrimmedStringOrNull(payload.currency) || "MXN";
  }

  const warnings = [];

  let updatedItem = inventoryItem;

  const fieldsToUpdate = { ...normalizedPayload };
  delete fieldsToUpdate.hasChanges;

  if (Object.keys(fieldsToUpdate).length > 0) {
    updatedItem = await inventoryRepository.updateInventoryItem(
      inventoryItemId,
      fieldsToUpdate,
    );
  }

  if (files.length > 0) {
    const existingImages =
      await inventoryRepository.findInventoryImagesByItemIdAndUserId(
        inventoryItemId,
        userId,
      );

    let position = existingImages.length + 1;
    const imagesToInsert = [];

    for (const file of files) {
      try {
        const uploadResult = await oneDriveService.uploadInventoryImage({
          userId,
          itemId: inventoryItemId,
          file,
          position,
        });

        imagesToInsert.push({
          inventoryItemId,
          userId,
          imageUrl: uploadResult.imageUrl,
          driveItemId: uploadResult.driveItemId,
          fileName: uploadResult.fileName,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          position,
        });

        position += 1;
      } catch (error) {
        warnings.push({
          path: "images",
          message:
            error.message ||
            `The image "${file.originalname}" could not be uploaded.`,
        });
      }
    }

    if (imagesToInsert.length > 0) {
      await inventoryRepository.createInventoryItemImages(imagesToInsert);
    }
  }

  const item = await inventoryRepository.findInventoryItemByIdAndUserId(
    inventoryItemId,
    userId,
  );

  const shouldTriggerTracking =
    item?.isTrackingEnabled &&
    item?.trackingUrl &&
    (Object.prototype.hasOwnProperty.call(payload, "trackingUrl") ||
      Object.prototype.hasOwnProperty.call(payload, "isTrackingEnabled") ||
      Object.prototype.hasOwnProperty.call(payload, "trackingFrequencyHours") ||
      Object.prototype.hasOwnProperty.call(payload, "currency") ||
      Object.prototype.hasOwnProperty.call(payload, "store"));

  if (shouldTriggerTracking) {
    await inventoryTrackingQueue.add(
      "process-inventory-batch",
      {
        itemIds: [item.id],
        scheduledAt: new Date().toISOString(),
      },
      {
        jobId: `inventory-immediate-update:${item.id}:${Date.now()}`,
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    );
  }

  return {
    item,
    warnings,
  };
}

async function deleteInventoryItem(userId, inventoryItemId) {
  const inventoryItem =
    await inventoryRepository.findInventoryItemById(inventoryItemId);

  if (!inventoryItem) {
    throw new AppError("Inventory item not found", 404);
  }

  if (inventoryItem.userId !== userId) {
    throw new AppError("Inventory item not found", 404);
  }

  await inventoryRepository.deleteInventoryItem(inventoryItemId);

  return null;
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
