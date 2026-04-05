"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeacherControllers_1 = require("../controllers/Teachers/TeacherControllers");
const auth_1 = require("../middleware/auth");
const TeacherRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/teacher/login:
 *   post:
 *     summary: Login for teacher
 *     tags: [Teacher]
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
TeacherRouter.post('/login', TeacherControllers_1.teacherLogin);
/**
 * @swagger
 * /api/teacher/mark-attendance:
 *   post:
 *     summary: Mark attendance for students (Teachers can only mark student attendance)
 *     tags: [Teacher]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent]
 *               type:
 *                 type: string
 *                 enum: [student]
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation error or invalid user type
 *       404:
 *         description: User not found
 */
TeacherRouter.post('/mark-attendance', auth_1.authenticateToken, auth_1.requireTeacher, TeacherControllers_1.markAttendance); // Assume auth middleware
exports.default = TeacherRouter;
