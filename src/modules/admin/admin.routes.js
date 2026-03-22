const express = require("express");
const adminController = require("./admin.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");
const validateSchema = require("../../middlewares/validateSchema.middleware");
const {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} = require("./admin.schema");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users", adminController.getUsers);

router.post(
  "/users",
  validateSchema(createUserSchema),
  adminController.createUser,
);

router.patch(
  "/users/:id/role",
  validateSchema(updateUserRoleSchema),
  adminController.updateUserRole,
);

router.patch(
  "/users/:id/status",
  validateSchema(updateUserStatusSchema),
  adminController.updateUserStatus,
);

module.exports = router;