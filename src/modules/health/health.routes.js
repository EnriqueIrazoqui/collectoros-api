const express = require ("express");
const {getHealth} = require("./health.controller");

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Check API and database health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API and database are running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get("/", getHealth);

module.exports = router;

