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

const createAccessRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(120, "Name must be at most 120 characters long"),

  email: z
    .string()
    .trim()
    .email("Email must be a valid email address")
    .max(180, "Email must be at most 180 characters long")
    .transform((value) => value.toLowerCase()),

  interest: optionalTrimmedString("Interest", 150),

  message: optionalTrimmedString("Message", 1000),
});

const updateAccessRequestStatusSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    message: "Status must be either approved or rejected",
  }),
});

module.exports = {
  createAccessRequestSchema,
  updateAccessRequestStatusSchema,
};