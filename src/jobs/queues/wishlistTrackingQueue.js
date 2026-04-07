const { Queue } = require("bullmq");
const redisConnection = require("../../config/redis");

const wishlistTrackingQueue = new Queue("wishlistTrackingQueue", {
  connection: redisConnection,
});

module.exports = wishlistTrackingQueue;