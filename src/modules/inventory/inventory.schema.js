const { z } = require("zod");

const createInventoryItemSchema = z.object({
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

  purchasePrice: z
    .number({ error: "Purchase price must be a number" })
    .nonnegative("Purchase price must be greater than or equal to 0")
    .optional()
    .nullable(),

  purchaseDate: z
    .string()
    .datetime("Purchase date must be a valid ISO datetime")
    .optional()
    .nullable(),

  currentEstimatedValue: z
    .number({ error: "Current estimated value must be a number" })
    .nonnegative("Current estimated value must be greater than or equal to 0")
    .optional()
    .nullable(),

  quantity: z
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .optional(),

  condition: z
    .string()
    .trim()
    .max(100, "Condition must be at most 100 characters long")
    .optional()
    .nullable(),
});

const updateInventoryItemSchema = createInventoryItemSchema.partial();

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
};
