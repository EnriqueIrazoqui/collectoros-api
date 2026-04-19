const createApp = require("./app");

require("../jobs/workers/analytics.worker");
require("../jobs/workers/wishlistTrackingWorker");
require("../jobs/workers/inventoryTrackingWorker");

const scheduleAnalyticsJobs = require("../jobs/schedulers/analytics.scheduler");
const {
  runWishlistTrackingBootstrap,
  initWishlistTrackingScheduler,
} = require("../jobs/schedulers/wishlistTrackingScheduler");
const {
  initInventoryTrackingScheduler,
} = require("../jobs/schedulers/inventoryTrackingScheduler");

const app = createApp();
const port = process.env.PORT;

app.listen(port, async () => {
  console.log(`CollectorsOS API running on port ${port}`);

  await scheduleAnalyticsJobs();

  // wishlist
  await runWishlistTrackingBootstrap();
  await initWishlistTrackingScheduler();

  // inventory
  await initInventoryTrackingScheduler();
});