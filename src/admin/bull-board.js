const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const analyticsQueue = require("../jobs/queues/analytics.queue");

function createBullBoardRouter() {
  const serverAdapter = new ExpressAdapter();

  serverAdapter.setBasePath("/api/admin/queues");

  createBullBoard({
    queues: [
      new BullMQAdapter(analyticsQueue),
    ],
    serverAdapter,
  });

  return serverAdapter.getRouter();
}

module.exports = createBullBoardRouter;