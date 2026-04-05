"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminControllers_1 = require("../controllers/Admin/AdminControllers");
const auth_1 = require("../middleware/auth");
const AdminRouter = (0, express_1.Router)();
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login for admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
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
AdminRouter.post('/login', AdminControllers_1.adminLogin);
/**
 * @swagger
 * /api/admin/mark-attendance:
 *   post:
 *     summary: Mark attendance for teachers and students
 *     tags: [Admin - Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, date, status, type]
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
 *                 enum: [student, teacher]
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
AdminRouter.post('/mark-attendance', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.markAttendance);
/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Admin - Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name, email, subject, branch]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               branch:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Can only create users in your branch
 */
AdminRouter.post('/teachers', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.createTeacher);
/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     summary: Get all teachers (in admin's branch)
 *     tags: [Admin - Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teachers
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
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   subject:
 *                     type: string
 *                   branch:
 *                     type: string
 */
AdminRouter.get('/teachers', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.getTeachers);
/**
 * @swagger
 * /api/admin/teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Admin - Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Teacher not found
 */
AdminRouter.get('/teachers/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.getTeacherById);
/**
 * @swagger
 * /api/admin/teachers/{id}:
 *   put:
 *     summary: Update teacher
 *     tags: [Admin - Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Teacher not found
 */
AdminRouter.put('/teachers/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.updateTeacher);
/**
 * @swagger
 * /api/admin/teachers/{id}:
 *   delete:
 *     summary: Delete teacher
 *     tags: [Admin - Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Teacher not found
 */
AdminRouter.delete('/teachers/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.deleteTeacher);
/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name, email, class, branch]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               class:
 *                 type: string
 *               branch:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Can only create users in your branch
 */
AdminRouter.post('/students', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.createStudent);
/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all students (in admin's branch)
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
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
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   class:
 *                     type: string
 *                   branch:
 *                     type: string
 */
AdminRouter.get('/students', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.getStudents);
/**
 * @swagger
 * /api/admin/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 */
AdminRouter.get('/students/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.getStudentById);
/**
 * @swagger
 * /api/admin/students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               class:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 */
AdminRouter.put('/students/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.updateStudent);
/**
 * @swagger
 * /api/admin/students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Admin - Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 */
AdminRouter.delete('/students/:id', auth_1.authenticateToken, auth_1.requireAdmin, AdminControllers_1.deleteStudent);
exports.default = AdminRouter;
