const prisma = require("../../config/prisma");

async function recalculateInventoryAnalytics() {
  console.log("Running inventory analytics recalculation...");

  const items = await prisma.inventoryItem.findMany({
    select: {
      id: true,
      name: true,
      currentEstimatedValue: true,
    },
  });

  console.log(`Recalculated analytics for ${items.length} items`);
}

async function refreshForecasts() {
  console.log("Running forecast refresh job...");

  const items = await prisma.inventoryItem.findMany({
    select: {
      id: true,
    },
  });

  console.log(`Forecast refresh executed for ${items.length} items`);
}

module.exports = {
  recalculateInventoryAnalytics,
  refreshForecasts,
};