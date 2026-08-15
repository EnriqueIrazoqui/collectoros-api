const AppError = require("../../common/errors/app-error");
const accessRequestRepository = require("./access-request.repository");
const emailService = require("../../services/email.service");
const crypto = require("crypto");

async function createAccessRequest(payload) {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const existingPendingRequest =
    await accessRequestRepository.findPendingAccessRequestByEmail(
      normalizedEmail,
    );

  if (existingPendingRequest) {
    throw new AppError(
      "An access request for this email is already pending review.",
      409,
    );
  }

  return accessRequestRepository.createAccessRequest({
    ...payload,
    email: normalizedEmail,
  });
}

async function getAccessRequests() {
  return accessRequestRepository.findAccessRequests();
}

async function updateAccessRequestStatus(id, status) {
  const accessRequest =
    await accessRequestRepository.findAccessRequestById(id);

  if (!accessRequest) {
    throw new AppError("Access request not found.", 404);
  }

  if (accessRequest.status !== "pending") {
    throw new AppError(
      `Access request has already been ${accessRequest.status}.`,
      409,
    );
  }

  if (status === "rejected") {
    return accessRequestRepository.updateAccessRequestStatus(id, {
      status: "rejected",
      reviewedAt: new Date(),
    });
  }

  const invitationToken = crypto.randomBytes(32).toString("hex");

  const invitationTokenHash = crypto
    .createHash("sha256")
    .update(invitationToken)
    .digest("hex");

  const invitationExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  const updatedAccessRequest =
    await accessRequestRepository.updateAccessRequestStatus(id, {
      status: "approved",
      reviewedAt: new Date(),
      invitationTokenHash,
      invitationExpiresAt,
      invitationAcceptedAt: null,
    });

  const invitationUrl =
    `${process.env.APP_URL}/accept-invitation?token=${encodeURIComponent(
      invitationToken,
    )}`;

  await emailService.sendAccessInvitation({
    to: accessRequest.email,
    name: accessRequest.name,
    invitationUrl,
  });

  return {
    accessRequest: updatedAccessRequest,
    invitationToken,
  };
}

module.exports = {
  createAccessRequest,
  getAccessRequests,
  updateAccessRequestStatus,
};