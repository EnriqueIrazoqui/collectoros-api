const {z} = require("zod");

const registerSchema = z.object({
    email: z.email("Email is invalid").trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters long")
    .max(50, "Display name must be at most 50 characters long"),
});

const loginSchema = z.object({
    email: z.email("Email is invalid").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
});

module.exports = {
    registerSchema,
    loginSchema,
};