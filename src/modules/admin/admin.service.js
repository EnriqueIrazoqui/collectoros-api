const bcrypt = require("bcryptjs");
const adminRepository = require("./admin.repository");

async function createUser(payload) {
  const email = payload.email.trim().toLowerCase();
  const displayName = payload.displayName.trim();
  const password = payload.password;
  const role = payload.role ? payload.role.trim().toLowerCase() : "user";

  const existingUser = await adminRepository.findUserByEmail(email);

  if (existingUser) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const allowedRoles = ["admin", "user"];

  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return adminRepository.createUser({
    email,
    displayName,
    passwordHash,
    role,
    isActive: true,
  });
}

async function getUsers() {
  return adminRepository.getUsers();
}

async function updateUserRole(targetUserId, newRole, currentUserId) {
  const role = newRole.trim().toLowerCase();
  const allowedRoles = ["admin", "user"];

  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const user = await adminRepository.findUserById(targetUserId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (Number(targetUserId) === Number(currentUserId) && role !== "admin") {
    const error = new Error("You cannot remove your own admin role");
    error.statusCode = 400;
    throw error;
  }

  return adminRepository.updateUserRole(Number(targetUserId), role);
}

async function updateUserStatus(targetUserId, isActive, currentUserId) {
  const user = await adminRepository.findUserById(targetUserId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (typeof isActive !== "boolean") {
    const error = new Error("isActive must be a boolean value");
    error.statusCode = 400;
    throw error;
  }

  if (Number(targetUserId) === Number(currentUserId) && isActive === false) {
    const error = new Error("You cannot deactivate your own account");
    error.statusCode = 400;
    throw error;
  }

  return adminRepository.updateUserStatus(Number(targetUserId), isActive);
}

module.exports = {
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
};