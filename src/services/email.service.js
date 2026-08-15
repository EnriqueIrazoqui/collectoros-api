const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendAccessInvitation({
  to,
  name,
  invitationUrl,
}) {
  const { data, error } = await resend.emails.send({
    from: "CollectorOS <noreply@getcollectoros.com>",
    to,
    subject: "Your CollectorOS access has been approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to CollectorOS</h1>

        <p>Hi ${name},</p>

        <p>
          Your access request has been approved.
          You can now create your CollectorOS account.
        </p>

        <p style="margin: 32px 0;">
          <a
            href="${invitationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111827;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Create your account
          </a>
        </p>

        <p>
          This invitation expires in 24 hours.
        </p>

        <p>
          If you did not request access to CollectorOS,
          you can safely ignore this email.
        </p>

        <p>
          — CollectorOS
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  sendAccessInvitation,
};