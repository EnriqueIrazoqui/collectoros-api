const prisma = require("../../config/prisma");

async function findAllWhatsNewEntries() {
  return prisma.whatsNew.findMany({
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
  });
}

async function createWhatsNew(data) {
  return prisma.whatsNew.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });
}

async function findPublishedWhatsNew(userId) {
  return prisma.whatsNew.findMany({
    where: {
      isPublished: true,
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      views: {
        where: {
          userId,
        },
        select: {
          viewedAt: true,
        },
      },
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });
}

async function findLatestPublishedWhatsNew(userId) {
  return prisma.whatsNew.findFirst({
    where: {
      isPublished: true,
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      views: {
        where: {
          userId,
        },
        select: {
          viewedAt: true,
        },
      },
    },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });
}

async function findWhatsNewById(whatsNewId) {
  return prisma.whatsNew.findUnique({
    where: {
      id: whatsNewId,
    },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });
}

async function updateWhatsNew(whatsNewId, data) {
  return prisma.whatsNew.update({
    where: {
      id: whatsNewId,
    },
    data,
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });
}

async function deleteWhatsNew(whatsNewId) {
  return prisma.whatsNew.delete({
    where: {
      id: whatsNewId,
    },
  });
}

async function markWhatsNewAsViewed(userId, whatsNewId) {
  return prisma.userWhatsNewView.upsert({
    where: {
      userId_whatsNewId: {
        userId,
        whatsNewId,
      },
    },
    update: {
      viewedAt: new Date(),
    },
    create: {
      userId,
      whatsNewId,
    },
  });
}

module.exports = {
  findAllWhatsNewEntries,
  createWhatsNew,
  findPublishedWhatsNew,
  findLatestPublishedWhatsNew,
  findWhatsNewById,
  updateWhatsNew,
  deleteWhatsNew,
  markWhatsNewAsViewed,
};