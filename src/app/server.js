const createApp = require("./app");
const env = require("../config/env");
require("../jobs/workers/analytics.worker");
const scheduleAnalyticsJobs = require("../jobs/scheduler/analytics.scheduler");

const app = createApp();
const port = process.env.PORT;

app.listen(port, async () => {
  console.log(`CollectorsOS API running on port ${port}`);

  await scheduleAnalyticsJobs();
});
