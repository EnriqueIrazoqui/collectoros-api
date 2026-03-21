const axios = require("axios");
const AppError = require("../common/errors/app-error");
const userRepository = require("../modules/users/user.repository");

async function refreshMicrosoftAccessToken(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user?.microsoftRefreshToken) {
    throw new AppError(
      "No hay refresh token de Microsoft. Reconecta tu cuenta.",
      400,
    );
  }

  const tenant = process.env.MICROSOFT_TENANT_ID || "common";

  const params = new URLSearchParams();
  params.append("client_id", process.env.MICROSOFT_CLIENT_ID);
  params.append("client_secret", process.env.MICROSOFT_CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", user.microsoftRefreshToken);
  params.append("scope", process.env.MICROSOFT_APP_SCOPES);

  try {
    const { data } = await axios.post(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const expiresAt = new Date(
      Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
    );

    await userRepository.updateMicrosoftTokens(userId, {
      microsoftAccessToken: data.access_token || null,
      microsoftRefreshToken: data.refresh_token || user.microsoftRefreshToken,
      microsoftTokenExpiresAt: expiresAt,
    });

    return (data.access_token || "").trim();
  } catch (error) {
    console.log("MS REFRESH STATUS:", error?.response?.status);
    console.log("MS REFRESH DATA:", error?.response?.data);

    throw new AppError(
      "No se pudo renovar el token de Microsoft. Reconecta tu cuenta.",
      502,
    );
  }
}

async function getValidMicrosoftAccessToken(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user?.microsoftAccessToken) {
    throw new AppError("Tu cuenta de Microsoft no está conectada", 400);
  }

  const expiresAt = user.microsoftTokenExpiresAt
    ? new Date(user.microsoftTokenExpiresAt)
    : null;

  const shouldRefresh =
    !expiresAt || expiresAt.getTime() <= Date.now() + 60 * 1000;

  if (!shouldRefresh) {
    return (user.microsoftAccessToken || "").trim();
  }

  return refreshMicrosoftAccessToken(userId);
}

module.exports = {
  refreshMicrosoftAccessToken,
  getValidMicrosoftAccessToken,
};