const AppError = require("../../common/errors/app-error");
const inventoryRepository = require("./inventory.repository");
const oneDriveService = require("../../services/oneDrive.service");
const prisma = require("../../config/prisma");

const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function normalizeInventoryPayload(payload) {
  return {
    ...payload,
    purchaseDate: payload.purchaseDate ? new Date(payload.purchaseDate) : null,
    quantity: payload.quantity ?? 1,
  };
}

function validateInventoryImages(files = []) {
  if (files.length > MAX_IMAGES) {
    throw new AppError("Solo se permiten hasta 5 imágenes por item", 400);
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new AppError(
        `Formato no permitido para ${file.originalname}. Solo se aceptan JPG, PNG y WEBP`,
        400,
      );
    }
  }
}

async function createInventoryItem(userId, payload, files = []) {
  validateInventoryImages(files);

  const normalizedPayload = normalizeInventoryPayload(payload);

  const inventoryItem = await inventoryRepository.createInventoryItem({
    userId,
    ...normalizedPayload,
  });

  if (files.length > 0) {
    const imagesToCreate = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const position = index + 1;

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
    }

    await inventoryRepository.createInventoryItemImages(imagesToCreate);
  }

  return inventoryRepository.findInventoryItemByIdAndUserId(
    inventoryItem.id,
    userId,
  );
}

async function getInventoryItems(userId) {
  return inventoryRepository.findInventoryItemsByUserId(userId);
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      microsoftAccessToken: true,
    },
  });

  if (!user?.microsoftAccessToken) {
    throw new AppError("El usuario no tiene Microsoft conectado", 400);
  }

  return oneDriveService.downloadFileByDriveItemId({
    accessToken: user.microsoftAccessToken,
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

  const normalizedPayload = {
    ...payload,
  };

  if (Object.prototype.hasOwnProperty.call(payload, "purchaseDate")) {
    normalizedPayload.purchaseDate = payload.purchaseDate
      ? new Date(payload.purchaseDate)
      : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "currentEstimatedValue")) {
    normalizedPayload.currentEstimatedValue = Number(
      payload.currentEstimatedValue,
    );
  }

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

      position++;
    }

    await inventoryRepository.createInventoryItemImages(imagesToInsert);
  }

  return updatedItem;
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
