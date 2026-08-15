const express = require("express");

const accessRequestController = require("./access-request.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");

const router = express.Router();

/**
 * @openapi
 * /access-requests:
 *   post:
 *     summary: Submit a new access request
 *     tags:
 *       - Access Requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Enrique Irazoqui
 *               email:
 *                 type: string
 *                 format: email
 *                 example: example@email.com
 *               interest:
 *                 type: string
 *                 nullable: true
 *                 example: Collection tracking
 *               message:
 *                 type: string
 *                 nullable: true
 *                 example: I would like to try CollectorOS for my personal collection.
 *     responses:
 *       201:
 *         description: Access request submitted successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: An access request for this email is already pending
 */
router.post("/", accessRequestController.createAccessRequest);

/**
 * @openapi
 * /access-requests:
 *   get:
 *     summary: Get all access requests
 *     tags:
 *       - Access Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  accessRequestController.getAccessRequests,
);

/**
 * @openapi
 * /access-requests/{id}/status:
 *   patch:
 *     summary: Approve or reject an access request
 *     tags:
 *       - Access Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access request ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - approved
 *                   - rejected
 *                 example: approved
 *     responses:
 *       200:
 *         description: Access request status updated successfully
 *       400:
 *         description: Invalid access request ID or status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Access request not found
 *       409:
 *         description: Access request has already been resolved
 */
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  accessRequestController.updateStatus,
);

module.exports = router;