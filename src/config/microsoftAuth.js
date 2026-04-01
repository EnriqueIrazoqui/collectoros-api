const { ConfidentialClientApplication } = require("@azure/msal-node");

const scopes = (process.env.MICROSOFT_APP_SCOPES || "")
  .split(" ")
  .map((scope) => scope.trim())
  .filter(Boolean);

const msalClient = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: "https://login.microsoftonline.com/common",
  },
});

module.exports = {
  msalClient,
  microsoftScopes: scopes,
};