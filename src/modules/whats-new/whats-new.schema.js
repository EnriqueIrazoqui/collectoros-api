const { z } = require("zod");

const whatsNewTypeValues = [
  "feature",
  "improvement",
  "fix",
  "announcement",
];

const createWhatsNewSchema = z.object({
  version: z.string().min(1).max(50),
  title: z.string().min(1).max(150),
  summary: z.string().min(1).max(300),
  content: z.string().min(1),
  type: z.enum(whatsNewTypeValues).optional().default("improvement"),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

const updateWhatsNewSchema = createWhatsNewSchema.partial();

module.exports = {
  createWhatsNewSchema,
  updateWhatsNewSchema,
};