const analyticsQueue = require("../queues/analytics.queue");

async function scheduleAnalyticsJobs() {

  const repeatableJobs = await analyticsQueue.getRepeatableJobs();

  const hasAnalyticsJob = repeatableJobs.find(
    job => job.name === "recalculateAnalytics"
  );

  const hasForecastJob = repeatableJobs.find(
    job => job.name === "refreshForecasts"
  );

  if (!hasAnalyticsJob) {
    await analyticsQueue.add(
      "recalculateAnalytics",
      {},
      {
        jobId: "recalculate-analytics",
        repeat: {
          pattern: "0 */12 * * *",
        },
      }
    );
  }

  if (!hasForecastJob) {
    await analyticsQueue.add(
      "refreshForecasts",
      {},
      {
        jobId: "refresh-forecasts",
        repeat: {
          pattern: "0 */24 * * *",
        },
      }
    );
  }

  console.log("Analytics jobs scheduled");
}

module.exports = scheduleAnalyticsJobs;