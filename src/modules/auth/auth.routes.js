const express = require("express");

const authController = require("./auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const microsoftController = require("./microsoft.controller");

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: Email is already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login a user and return an access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", authController.login);

router.post("/refresh", authController.refresh);
router.post("/logout", authMiddleware, authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @openapi
 * /auth/microsoft/login:
 *   get:
 *     summary: Generate Microsoft authorization URL
 *     tags:
 *       - Microsoft Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Microsoft authorization URL generated successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/microsoft/login",
  authMiddleware,
  microsoftController.microsoftLogin,
);

/**
 * @openapi
 * /auth/microsoft/callback:
 *   get:
 *     summary: Handle Microsoft OAuth callback
 *     tags:
 *       - Microsoft Auth
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects user back to the application after successful Microsoft connection
 *       400:
 *         description: Invalid Microsoft callback request
 */
router.get("/microsoft/callback", microsoftController.microsoftCallback);

/**
 * @openapi
 * /auth/me/welcome/seen:
 *   patch:
 *     summary: Mark welcome guide as seen for the current user
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         hasSeenWelcome:
 *                           type: boolean
 *                           example: true
 *                         welcomeSeenAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2026-03-29T18:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/me/welcome/seen",
  authMiddleware,
  authController.markWelcomeSeen,
);

module.exports = router;
