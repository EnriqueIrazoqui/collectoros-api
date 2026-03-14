const { z } = require("zod");

const createWishlistItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name must be at most 150 characters long"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must be at most 100 characters long"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters long")
    .optional()
    .nullable(),

  targetPrice: z
    .number({ error: "Target price must be a number" })
    .nonnegative("Target price must be greater than or equal to 0")
    .optional()
    .nullable(),

  currentObservedPrice: z
    .number({ error: "Current observed price must be a number" })
    .nonnegative("Current observed price must be greater than or equal to 0")
    .optional()
    .nullable(),

  priority: z
    .string()
    .trim()
    .max(50, "Priority must be at most 50 characters long")
    .optional()
    .nullable(),

  purchaseUrl: z
    .url("Purchase URL must be a valid URL")
    .optional()
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be at most 1000 characters long")
    .optional()
    .nullable(),
});

const updateWishlistItemSchema = createWishlistItemSchema.partial();

module.exports = {
  createWishlistItemSchema,
  updateWishlistItemSchema,
};