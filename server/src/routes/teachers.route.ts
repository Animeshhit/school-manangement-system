import {Router} from 'express';
import { teacherLogin, markAttendance } from '../controllers/Teachers/TeacherControllers';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const TeacherRouter = Router();

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
TeacherRouter.post('/login', teacherLogin);

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
TeacherRouter.post('/mark-attendance', authenticateToken, requireTeacher, markAttendance); // Assume auth middleware

export default TeacherRouter;