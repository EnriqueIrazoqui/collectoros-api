require("dotenv").config();

console.log(
  "RESEND_API_KEY loaded:",
  Boolean(process.env.RESEND_API_KEY),
);

const emailService = require("./src/services/email.service");

async function main() {
  try {
    const result = await emailService.sendAccessInvitation({
      to: "eirazoquiruelas@gmail.com",
      name: "Enrique",
      invitationUrl:
        "http://localhost:5173/accept-invitation?token=test-token-123",
    });

    console.log("Invitation email sent:", result);
  } catch (error) {
    console.error("Invitation email error:", error);
  }
}

main();