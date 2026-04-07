const prisma = require("../../../config/prisma");

async function getAlertsByUserId(userId) {
  return prisma.wishlistAlert.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      status: true,
      priority: true,
      triggeredPrice: true,
      previousPrice: true,
      targetPrice: true,
      percentageChange: true,
      metadata: true,
      triggeredAt: true,
      readAt: true,
      createdAt: true,
      wishlistItemId: true,
      wishlistItem: {
        select: {
          id: true,
          name: true,
          purchaseUrl: true,
        },
      },
    },
    orderBy: {
      triggeredAt: "desc",
    },
  });
}

async function markAlertAsRead(alertId, userId) {
  const alert = await prisma.wishlistAlert.findFirst({
    where: {
      id: alertId,
      userId,
    },
  });

  if (!alert) {
    throw new Error("Wishlist alert not found");
  }

  return prisma.wishlistAlert.update({
    where: {
      id: alertId,
    },
    data: {
      status: "read",
      readAt: new Date(),
    },
  });
}

async function markAllAlertsAsRead(userId) {
  return prisma.wishlistAlert.updateMany({
    where: {
      userId,
      status: "unread",
    },
    data: {
      status: "read",
      readAt: new Date(),
    },
  });
}

async function getUnreadCount(userId) {
  return prisma.wishlistAlert.count({
    where: {
      userId,
      status: "unread",
    },
  });
}

module.exports = {
  getAlertsByUserId,
  markAlertAsRead,
  markAllAlertsAsRead,
  getUnreadCount,
};
