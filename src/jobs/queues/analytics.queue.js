const { Queue } = require("bullmq");
const redis = require("../../config/redis");

const analyticsQueue = new Queue("analyticsQueue", {
  connection: redis,
});

module.exports = analyticsQueue;