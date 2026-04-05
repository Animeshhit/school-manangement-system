"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StudentControllers_1 = require("../controllers/Students/StudentControllers");
const auth_1 = require("../middleware/auth");
const StudentRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/student/login:
 *   post:
 *     summary: Login for student
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
StudentRouter.post('/login', StudentControllers_1.studentLogin);
/**
 * @swagger
 * /api/student/attendance:
 *   get:
 *     summary: Get student's own attendance
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   status:
 *                     type: string
 *                   markedBy:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *       500:
 *         description: Server error
 */
StudentRouter.get('/attendance', auth_1.authenticateToken, auth_1.requireStudent, StudentControllers_1.getAttendance); // Assume auth middleware
exports.default = StudentRouter;
