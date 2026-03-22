const adminService = require("./admin.service");

async function createUser(request, response, next) {
  try {
    const user = await adminService.createUser(request.body);

    return response.status(201).json({
      ok: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(request, response, next) {
  try {
    const users = await adminService.getUsers();

    return response.status(200).json({
      ok: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(request, response, next) {
  try {
    const userId = Number(request.params.id);
    const { role } = request.body;

    const updatedUser = await adminService.updateUserRole(
      userId,
      role,
      request.user.id,
    );

    return response.status(200).json({
      ok: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUserStatus(request, response, next) {
  try {
    const userId = Number(request.params.id);
    const { isActive } = request.body;

    const updatedUser = await adminService.updateUserStatus(
      userId,
      isActive,
      request.user.id,
    );

    return response.status(200).json({
      ok: true,
      message: "User status updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
};