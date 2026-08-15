const { sendSuccessResponse } = require("../../common/utils/response");
const accessRequestService = require("./access-request.service");
const AppError = require("../../common/errors/app-error");
const {
  createAccessRequestSchema,
  updateAccessRequestStatusSchema,
} = require("./access-request.schema");

async function createAccessRequest(request, response, next) {
  try {
    const payload = createAccessRequestSchema.parse(request.body);

    const accessRequest =
      await accessRequestService.createAccessRequest(payload);

    return sendSuccessResponse(response, {
      statusCode: 201,
      message: "Access request submitted successfully",
      data: accessRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAccessRequests(request, response, next) {
  try {
    const accessRequests = await accessRequestService.getAccessRequests();

    return sendSuccessResponse(response, {
      message: "Access requests retrieved successfully",
      data: accessRequests,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(request, response, next) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Invalid access request id.", 400);
    }

    const payload = updateAccessRequestStatusSchema.parse(request.body);

    const result = await accessRequestService.updateAccessRequestStatus(
      id,
      payload.status,
    );

    if (payload.status === "approved") {
      return sendSuccessResponse(response, {
        statusCode: 200,
        message: "Access request approved successfully",
        data: {
          accessRequest: result.accessRequest,
          invitationToken: result.invitationToken,
        },
      });
    }

    return sendSuccessResponse(response, {
      statusCode: 200,
      message: "Access request rejected successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAccessRequest,
  getAccessRequests,
  updateStatus,
};
