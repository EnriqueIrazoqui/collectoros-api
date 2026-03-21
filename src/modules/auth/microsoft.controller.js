const axios = require("axios");
const userRepository = require("../users/user.repository");

function buildMicrosoftAuthUrl({ userId }) {
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  const baseUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    response_mode: "query",
    scope: process.env.MICROSOFT_APP_SCOPES,
    state: String(userId),
    prompt: "consent",
  });

  return `${baseUrl}?${params.toString()}`;
}

async function microsoftLogin(request, response, next) {
  try {
    const userId = request.user.id;
    const authUrl = buildMicrosoftAuthUrl({ userId });

    return response.status(200).json({
      ok: true,
      message: "Microsoft auth URL generated successfully",
      data: {
        authUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function microsoftCallback(request, response, next) {
  try {
    const { code, state } = request.query;

    if (!code || !state) {
      return response.status(400).json({
        ok: false,
        message: "Invalid Microsoft callback",
      });
    }

    const userId = Number(state);

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        ok: false,
        message: "Invalid Microsoft callback",
      });
    }

    const tenant = process.env.MICROSOFT_TENANT_ID || "common";

    const params = new URLSearchParams();
    params.append("client_id", process.env.MICROSOFT_CLIENT_ID);
    params.append("client_secret", process.env.MICROSOFT_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.MICROSOFT_REDIRECT_URI);
    params.append("scope", process.env.MICROSOFT_APP_SCOPES);

    const { data } = await axios.post(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    console.log("MS TOKEN RESPONSE KEYS:", Object.keys(data || {}));
    console.log("MS ACCESS TOKEN EXISTS:", !!data?.access_token);
    console.log("MS REFRESH TOKEN EXISTS:", !!data?.refresh_token);

    const profileResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      },
    );

    const expiresAt = new Date(
      Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
    );

    await userRepository.updateMicrosoftTokens(userId, {
      microsoftAccountId: profileResponse.data?.id || null,
      microsoftAccessToken: data.access_token ? data.access_token.trim() : null,
      microsoftRefreshToken: data.refresh_token
        ? data.refresh_token.trim()
        : null,
      microsoftTokenExpiresAt: expiresAt,
    });

    const appUrl = process.env.APP_URL || "http://localhost:5173";

    return response.redirect(`${appUrl}/inventory?microsoft_connected=1`);
  } catch (error) {
    console.log("MS CALLBACK STATUS:", error?.response?.status);
    console.log("MS CALLBACK DATA:", error?.response?.data);
    return next(error);
  }
}

module.exports = {
  microsoftLogin,
  microsoftCallback,
};