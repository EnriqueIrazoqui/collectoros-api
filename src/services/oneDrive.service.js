const axios = require("axios");
const AppError = require("../common/errors/app-error");
const userRepository = require("../modules/users/user.repository");

function getFileExtension(fileName = "") {
  if (!fileName.includes(".")) {
    return "jpg";
  }

  return fileName.split(".").pop().toLowerCase();
}

async function ensureFolder(accessToken, parentPath, folderName) {
  const url = parentPath
    ? `https://graph.microsoft.com/v1.0/me/drive/root:/${parentPath}:/children`
    : "https://graph.microsoft.com/v1.0/me/drive/root/children";

  try {
    const { data } = await axios.post(
      url,
      {
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return data;
  } catch (error) {
    if (error?.response?.status === 409) {
      return null;
    }

    console.log("ENSURE FOLDER STATUS:", error?.response?.status);
    console.log("ENSURE FOLDER DATA:", error?.response?.data);

    const message =
      error?.response?.data?.error?.message ||
      "No se pudo crear la carpeta en OneDrive";

    throw new AppError(message, error?.response?.status || 500);
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

  if (!user.microsoftAccessToken) {
    throw new AppError("Tu cuenta de Microsoft no está conectada", 400);
  }

  const accessToken = (user.microsoftAccessToken || "").trim();
  const extension = getFileExtension(file.originalname);
  const fileName = `img_${position}_${Date.now()}.${extension}`;

  try {
    await ensureInventoryFolderPath(accessToken, itemId);

    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/CollectorOS/${itemId}/${fileName}:/content`;

    console.log("UPLOAD URL:", uploadUrl);

    const { data } = await axios.put(uploadUrl, file.buffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": file.mimetype,
      },
      maxBodyLength: Infinity,
    });

    console.log("UPLOAD RESPONSE:", data);

    return {
      imageUrl: data?.webUrl || "",
      driveItemId: data?.id || null,
      fileName: data?.name || fileName,
    };
  } catch (error) {
    console.log("GRAPH STATUS:", error?.response?.status);
    console.log("GRAPH DATA:", error?.response?.data);

    const message =
      error?.response?.data?.error?.message ||
      "No se pudo subir la imagen a OneDrive";

    throw new AppError(message, error?.response?.status || 500);
  }
}

async function downloadFileByDriveItemId({
  accessToken,
  driveItemId,
  fileName,
}) {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/drive/items/${driveItemId}/content`,
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
