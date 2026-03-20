const { z } = require("zod");

const emptyStringToNull = (value) => {
  if (value === "" || value === undefined) {
    return null;
  }

  return value;
};

const optionalTrimmedString = (fieldName, maxLength) =>
  z.preprocess(
    emptyStringToNull,
    z
      .string()
      .trim()
      .max(
        maxLength,
        `${fieldName} must be at most ${maxLength} characters long`,
      )
      .nullable()
      .optional(),
  );

const optionalNonNegativeNumber = (fieldLabel) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === undefined || value === null) {
        return null;
      }

      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? value : parsedValue;
    },
    z
      .number({
        invalid_type_error: `${fieldLabel} must be a number`,
      })
      .nonnegative(`${fieldLabel} must be greater than or equal to 0`)
      .nullable()
      .optional(),
  );

const optionalPositiveInt = (fieldLabel) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? value : parsedValue;
    },
    z
      .number({
        invalid_type_error: `${fieldLabel} must be a number`,
      })
      .int(`${fieldLabel} must be an integer`)
      .min(1, `${fieldLabel} must be at least 1`)
      .optional(),
  );

const optionalDateString = z.preprocess(
  emptyStringToNull,
  z.string().trim().nullable().optional(),
);

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

  description: optionalTrimmedString("Description", 1000),

  purchasePrice: optionalNonNegativeNumber("Purchase price"),

  purchaseDate: optionalDateString,

  currentEstimatedValue: optionalNonNegativeNumber("Current estimated value"),

  quantity: optionalPositiveInt("Quantity"),

  condition: optionalTrimmedString("Condition", 100),
});

const updateInventoryItemSchema = z.object({
  description: z.string().optional(),
  currentEstimatedValue: z.string().optional(),
  condition: z.string().optional(),
  purchaseDate: z.string().optional(),
  hasChanges: z.string().optional(),
});

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
};
