const { Worker } = require("bullmq");
const redis = require("../../config/redis");
const processor = require("../processors/analytics.processor");

const worker = new Worker(
  "analyticsQueue",
  async (job) => {
    switch (job.name) {
      case "recalculateAnalytics":
        return processor.recalculateInventoryAnalytics();

      case "refreshForecasts":
        return processor.refreshForecasts();

      default:
        throw new Error("Unknown job type");
    }
  },
  {
    connection: redis,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.name} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.name} failed`, err);
});

module.exports = worker;