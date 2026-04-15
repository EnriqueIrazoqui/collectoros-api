const { sendSuccessResponse } = require("../../common/utils/response");
const {
  createWhatsNewSchema,
  updateWhatsNewSchema,
} = require("./whats-new.schema");
const whatsNewService = require("./whats-new.service");

async function getAllWhatsNewEntries(request, response, next) {
  try {
    const entries = await whatsNewService.getAllWhatsNewEntries();

    return sendSuccessResponse(response, {
      message: "What's new admin entries retrieved successfully",
      data: entries,
    });
  } catch (error) {
    return next(error);
  }
}

async function createWhatsNew(request, response, next) {
  try {
    const payload = createWhatsNewSchema.parse(request.body);

    const whatsNewEntry = await whatsNewService.createWhatsNew(
      request.user.id,
      payload,
    );

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "What's new entry created successfully",
      data: whatsNewEntry,
    });
  } catch (error) {
    return next(error);
  }
}

async function getWhatsNewList(request, response, next) {
  try {
    const whatsNewEntries = await whatsNewService.getWhatsNewList(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "What's new entries retrieved successfully",
      data: whatsNewEntries,
    });
  } catch (error) {
    return next(error);
  }
}

async function getLatestWhatsNew(request, response, next) {
  try {
    const latestWhatsNewEntry = await whatsNewService.getLatestWhatsNew(
      request.user.id,
    );

    return sendSuccessResponse(response, {
      message: "Latest what's new entry retrieved successfully",
      data: latestWhatsNewEntry,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateWhatsNew(request, response, next) {
  try {
    const whatsNewId = Number(request.params.whatsNewId);
    const payload = updateWhatsNewSchema.parse(request.body);

    const updatedEntry = await whatsNewService.updateWhatsNew(
      whatsNewId,
      payload,
    );

    return sendSuccessResponse(response, {
      message: "What's new entry updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    return next(error);
  }
}

async function publishWhatsNew(request, response, next) {
  try {
    const whatsNewId = Number(request.params.whatsNewId);

    const publishedEntry = await whatsNewService.publishWhatsNew(whatsNewId);

    return sendSuccessResponse(response, {
      message: "What's new entry published successfully",
      data: publishedEntry,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteWhatsNew(request, response, next) {
  try {
    const whatsNewId = Number(request.params.whatsNewId);

    await whatsNewService.deleteWhatsNew(whatsNewId);

    return sendSuccessResponse(response, {
      message: "What's new entry deleted successfully",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function markWhatsNewAsViewed(request, response, next) {
  try {
    const whatsNewId = Number(request.params.whatsNewId);

    const viewedEntry = await whatsNewService.markWhatsNewAsViewed(
      request.user.id,
      whatsNewId,
    );

    return sendSuccessResponse(response, {
      message: "What's new entry marked as viewed successfully",
      data: viewedEntry,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllWhatsNewEntries,
  createWhatsNew,
  getWhatsNewList,
  getLatestWhatsNew,
  updateWhatsNew,
  publishWhatsNew,
  deleteWhatsNew,
  markWhatsNewAsViewed,
};