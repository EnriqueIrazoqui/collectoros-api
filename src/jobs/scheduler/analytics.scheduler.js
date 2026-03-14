const analyticsQueue = require("../queues/analytics.queue");

async function scheduleAnalyticsJobs() {
  await analyticsQueue.add(
    "recalculateAnalytics",
    {},
    {
      repeat: {
        pattern: "0 */12 * * *",
      },
    }
  );

  await analyticsQueue.add(
    "refreshForecasts",
    {},
    {
      repeat: {
        pattern: "0 */24 * * *",
      },
    }
  );

  console.log("Analytics jobs scheduled");
}

module.exports = scheduleAnalyticsJobs;