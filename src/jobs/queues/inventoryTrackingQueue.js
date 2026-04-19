const { Queue } = require("bullmq");
const redisConnection = require("../../config/redis");

const inventoryTrackingQueue = new Queue("inventoryTrackingQueue", {
  connection: redisConnection,
});

module.exports = inventoryTrackingQueue;