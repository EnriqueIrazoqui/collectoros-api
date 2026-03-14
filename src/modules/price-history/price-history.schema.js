const { z } = require("zod");

const createPriceHistorySchema = z.object({
  itemId: z
    .number({ error: "Item id must be a number" })
    .int("Item id must be an integer")
    .positive("Item id must be greater than 0"),

  price: z
    .number({ error: "Price must be a number" })
    .nonnegative("Price must be greater than or equal to 0"),

  source: z
    .string()
    .trim()
    .max(150, "Source must be at most 150 characters long")
    .optional()
    .nullable(),
});

module.exports = {
  createPriceHistorySchema,
};