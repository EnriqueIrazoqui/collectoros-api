const prisma = require("../../config/prisma");

async function createAccessRequest(data) {
  return prisma.accessRequest.create({
    data,
  });
}

async function findPendingAccessRequestByEmail(email) {
  return prisma.accessRequest.findFirst({
    where: {
      email,
      status: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findAccessRequests() {
  return prisma.accessRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function findAccessRequestById(id) {
  return prisma.accessRequest.findUnique({
    where: {
      id,
    },
  });
}

async function updateAccessRequestStatus(
  id,
  data,
  db = prisma,
) {
  return db.accessRequest.update({
    where: {
      id,
    },
    data,
  });
}

async function findAccessRequestByInvitationTokenHash(
  invitationTokenHash,
) {
  return prisma.accessRequest.findFirst({
    where: {
      invitationTokenHash,
    },
  });
}

module.exports = {
  createAccessRequest,
  findPendingAccessRequestByEmail,
  findAccessRequests,
  findAccessRequestById,
  updateAccessRequestStatus,
  findAccessRequestByInvitationTokenHash,
};
