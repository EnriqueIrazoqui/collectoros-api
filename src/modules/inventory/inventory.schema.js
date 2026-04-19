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

const optionalBoolean = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean().optional());

const optionalDateString = z.preprocess(
  emptyStringToNull,
  z.string().trim().nullable().optional(),
);

const optionalUrlString = (fieldName, maxLength = 1000) =>
  z.preprocess(
    emptyStringToNull,
    z
      .string()
      .trim()
      .max(
        maxLength,
        `${fieldName} must be at most ${maxLength} characters long`,
      )
      .url(`${fieldName} must be a valid URL`)
      .nullable()
      .optional(),
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

  trackingUrl: optionalUrlString("Tracking URL"),
  store: optionalTrimmedString("Store", 100),
  isTrackingEnabled: optionalBoolean,
  trackingFrequencyHours: optionalPositiveInt("Tracking frequency hours"),
  currency: optionalTrimmedString("Currency", 10),
});

const updateInventoryItemSchema = z.object({
  name: z.string().trim().max(150).optional(),
  category: z.string().trim().max(100).optional(),
  description: z.string().optional(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  currentEstimatedValue: z.string().optional(),
  quantity: z.string().optional(),
  condition: z.string().optional(),

  trackingUrl: z.string().optional(),
  store: z.string().optional(),
  isTrackingEnabled: z.string().optional(),
  trackingFrequencyHours: z.string().optional(),
  currency: z.string().optional(),

  hasChanges: z.string().optional(),
});

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
};