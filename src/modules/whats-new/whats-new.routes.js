const express = require("express");

const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");
const whatsNewController = require("./whats-new.controller");

const router = express.Router();

/**
 * @openapi
 * /whats-new:
 *   get:
 *     summary: Get published what's new entries
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: What's new entries retrieved successfully
 */
router.get("/", authMiddleware, whatsNewController.getWhatsNewList);

/**
 * @openapi
 * /whats-new/latest:
 *   get:
 *     summary: Get latest published what's new entry
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest what's new entry retrieved successfully
 */
router.get("/latest", authMiddleware, whatsNewController.getLatestWhatsNew);

/**
 * @openapi
 * /whats-new/{whatsNewId}/mark-viewed:
 *   post:
 *     summary: Mark a what's new entry as viewed
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: whatsNewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: What's new entry marked as viewed successfully
 *       404:
 *         description: What's new entry not found
 */
router.post(
  "/:whatsNewId/mark-viewed",
  authMiddleware,
  whatsNewController.markWhatsNewAsViewed,
);

// Admin routes
router.use(authMiddleware, adminMiddleware);

router.get("/admin/all", whatsNewController.getAllWhatsNewEntries);

/**
 * @openapi
 * /whats-new:
 *   post:
 *     summary: Create a new what's new entry
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: What's new entry created successfully
 */
router.post("/", whatsNewController.createWhatsNew);

/**
 * @openapi
 * /whats-new/{whatsNewId}:
 *   patch:
 *     summary: Update a what's new entry
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: whatsNewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: What's new entry updated successfully
 *       404:
 *         description: What's new entry not found
 */
router.patch("/:whatsNewId", whatsNewController.updateWhatsNew);

/**
 * @openapi
 * /whats-new/{whatsNewId}/publish:
 *   patch:
 *     summary: Publish a what's new entry
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: whatsNewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: What's new entry published successfully
 *       404:
 *         description: What's new entry not found
 */
router.patch("/:whatsNewId/publish", whatsNewController.publishWhatsNew);

/**
 * @openapi
 * /whats-new/{whatsNewId}:
 *   delete:
 *     summary: Delete a what's new entry
 *     tags:
 *       - Whats New
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: whatsNewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: What's new entry deleted successfully
 *       404:
 *         description: What's new entry not found
 */
router.delete("/:whatsNewId", whatsNewController.deleteWhatsNew);

module.exports = router;