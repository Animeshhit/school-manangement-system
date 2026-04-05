import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();




/**
 * @swagger
 * /api/verify/login:
 *   post:
 *     summary: Verify login token
 *     description: Verifies the authentication token sent in the Authorization header.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token (e.g., "Bearer <token>")
 *     responses:
 *       200:
 *         description: Verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized / Missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access token required
 *       403:
 *         description: Forbidden / Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */

router.post('/verify/login', authenticateToken, (req,res) => {
    res.json({ verified: true });
});









export default router;