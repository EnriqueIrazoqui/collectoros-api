const axios = require("axios");
const AppError = require("../common/errors/app-error");
const userRepository = require("../modules/users/user.repository");
const { getValidMicrosoftAccessToken } = require("./microsoftToken.service");

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

function getFileExtension(fileName = "") {
  if (!fileName.includes(".")) {
    return "jpg";
  }

  return fileName.split(".").pop().toLowerCase();
}

function buildGraphHeaders(accessToken, contentType = "application/json") {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": contentType,
  };
}

function extractGraphErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error?.message || fallbackMessage;
}

function throwFriendlyOneDriveError(error, fallbackMessage) {
  if (error instanceof AppError) {
    throw error;
  }

  const status = error?.response?.status || 500;
  const graphMessage = extractGraphErrorMessage(error, fallbackMessage);

  console.log("GRAPH STATUS:", error?.response?.status);
  console.log("GRAPH DATA:", error?.response?.data);

  if (graphMessage.includes("SPO license")) {
    throw new AppError(
      "La cuenta de Microsoft conectada no tiene acceso compatible a OneDrive o SharePoint para subir archivos.",
      400,
    );
  }

  if (status === 401 || status === 403) {
    throw new AppError(
      "No se pudo acceder a OneDrive. Reconecta tu cuenta de Microsoft.",
      502,
    );
  }

  throw new AppError(graphMessage, status);
}

async function validateUserDrive(accessToken) {
  try {
    const { data } = await axios.get(`${GRAPH_BASE_URL}/me/drive`, {
      headers: buildGraphHeaders(accessToken),
    });

    return data;
  } catch (error) {
    throwFriendlyOneDriveError(
      error,
      "No se pudo acceder al drive del usuario en OneDrive",
    );
  }
}

async function ensureFolder(accessToken, parentPath, folderName) {
  const url = parentPath
    ? `${GRAPH_BASE_URL}/me/drive/root:/${parentPath}:/children`
    : `${GRAPH_BASE_URL}/me/drive/root/children`;

  try {
    const { data } = await axios.post(
      url,
      {
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail",
      },
      {
        headers: buildGraphHeaders(accessToken),
      },
    );

    return data;
  } catch (error) {
    if (error?.response?.status === 409) {
      return null;
    }

    console.log("ENSURE FOLDER STATUS:", error?.response?.status);
    console.log("ENSURE FOLDER DATA:", error?.response?.data);

    throwFriendlyOneDriveError(
      error,
      "No se pudo crear la carpeta en OneDrive",
    );
  }
}

async function ensureInventoryFolderPath(accessToken, itemId) {
  await ensureFolder(accessToken, "", "CollectorOS");
  await ensureFolder(accessToken, "CollectorOS", String(itemId));
}

async function uploadInventoryImage({ userId, itemId, file, position }) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (!file?.buffer) {
    throw new AppError("No se recibió ningún archivo válido", 400);
  }

  const accessToken = await getValidMicrosoftAccessToken(userId);
  const extension = getFileExtension(file.originalname);
  const fileName = `img_${position}_${Date.now()}.${extension}`;

  try {
    await validateUserDrive(accessToken);
    await ensureInventoryFolderPath(accessToken, itemId);

    const uploadUrl = `${GRAPH_BASE_URL}/me/drive/root:/CollectorOS/${itemId}/${fileName}:/content`;

    const { data } = await axios.put(uploadUrl, file.buffer, {
      headers: buildGraphHeaders(accessToken, file.mimetype),
      maxBodyLength: Infinity,
    });

    return {
      imageUrl: data?.webUrl || "",
      driveItemId: data?.id || null,
      fileName: data?.name || fileName,
    };
  } catch (error) {
    throwFriendlyOneDriveError(
      error,
      "No se pudo subir la imagen a OneDrive",
    );
  }
}

async function downloadFileByDriveItemId({
  userId,
  driveItemId,
  fileName,
}) {
  try {
    const accessToken = await getValidMicrosoftAccessToken(userId);

    const response = await axios.get(
      `${GRAPH_BASE_URL}/me/drive/items/${driveItemId}/content`,
      {
        responseType: "stream",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        maxRedirects: 5,
      },
    );

    return {
      stream: response.data,
      contentType: response.headers["content-type"],
      contentLength: response.headers["content-length"],
      fileName,
    };
  } catch (error) {
    console.log("DOWNLOAD STATUS:", error?.response?.status);
    console.log("DOWNLOAD DATA:", error?.response?.data);

    const status = error?.response?.status;
    const message =
      error?.response?.data?.error?.message ||
      "No se pudo descargar la imagen desde OneDrive";

    if (message.includes("SPO license")) {
      throw new AppError(
        "La cuenta de Microsoft conectada no tiene acceso compatible a OneDrive o SharePoint para descargar archivos.",
        400,
      );
    }

    if (status === 401 || status === 403) {
      throw new AppError(
        "No se pudo acceder a OneDrive. Reconecta tu cuenta de Microsoft.",
        502,
      );
    }

    throw new AppError(message, status || 500);
  }
}

module.exports = {
  uploadInventoryImage,
  downloadFileByDriveItemId,
};