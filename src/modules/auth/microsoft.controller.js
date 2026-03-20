const { msalClient, microsoftScopes } = require("../../config/microsoftAuth");
const userRepository = require("../users/user.repository");

async function microsoftLogin(request, response, next) {
  try {
    const userId = request.user.id;

    const authUrl = await msalClient.getAuthCodeUrl({
      scopes: microsoftScopes,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI,
      state: String(userId),
      prompt: "select_account",
    });

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
        message: "Microsoft callback inválido",
      });
    }

    const userId = Number(state);

    const tokenResponse = await msalClient.acquireTokenByCode({
      code,
      scopes: microsoftScopes,
      redirectUri: process.env.MICROSOFT_REDIRECT_URI,
    });

    console.log("MS TOKEN START:", tokenResponse.accessToken?.slice(0, 25));
    console.log("MS TOKEN LENGTH:", tokenResponse.accessToken?.length);
    console.log("MS EXPIRES ON:", tokenResponse.expiresOn);
    console.log("MS ACCOUNT:", tokenResponse.account);

    await userRepository.updateMicrosoftTokens(userId, {
      microsoftAccountId: tokenResponse.account?.homeAccountId || null,
      microsoftAccessToken: tokenResponse.accessToken || null,
      microsoftRefreshToken: tokenResponse.refreshToken || null,
      microsoftTokenExpiresAt: tokenResponse.expiresOn || null,
    });

    const appUrl = process.env.APP_URL || "http://localhost:5173";

    return response.redirect(`${appUrl}/inventory?microsoft_connected=1`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  microsoftLogin,
  microsoftCallback,
};
