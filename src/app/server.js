const createApp = require("./app");
const env = require("../config/env");

require("../jobs/workers/analytics.worker");
require("../jobs/workers/wishlistTrackingWorker");

const scheduleAnalyticsJobs = require("../jobs/schedulers/analytics.scheduler");
const { scheduleDueWishlistItems } = require("../jobs/schedulers/wishlistTrackingScheduler");

const app = createApp();
const port = process.env.PORT;

app.listen(port, async () => {
  console.log(`CollectorsOS API running on port ${port}`);

  await scheduleAnalyticsJobs();
  await scheduleDueWishlistItems();
});