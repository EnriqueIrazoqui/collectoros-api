const { z } = require("zod");

const createUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),

  displayName: z
    .string({
      required_error: "Display name is required",
    })
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name is too long"),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters"),

  role: z.enum(["admin", "user"]).optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "user"], {
    required_error: "Role is required",
  }),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive is required",
  }),
});

module.exports = {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
};