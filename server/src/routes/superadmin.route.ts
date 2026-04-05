import {Router} from 'express';
import { 
  superAdminLogin, 
  markAttendance, 
  createUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  changePassword,
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch
} from '../controllers/SuperAdmin/SuperAdminControllers';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth';

const SuperAdminRouter = Router();

/**
 * @swagger
 * /api/superadmin/login:
 *   post:
 *     summary: Superadmin login with default credentials
 *     tags: [SuperAdmin]
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
SuperAdminRouter.post('/login', superAdminLogin);

/**
 * @swagger
 * /api/superadmin/change-password:
 *   post:
 *     summary: Change superadmin password (on first login)
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Old password is incorrect
 *       404:
 *         description: User not found
 */
SuperAdminRouter.post('/change-password', authenticateToken, requireSuperAdmin, changePassword);

/**
 * @swagger
 * /api/superadmin/users:
 *   post:
 *     summary: Create a new user (any role)
 *     tags: [SuperAdmin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, teacher, student]
 *               branch:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               class:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
SuperAdminRouter.post('/users', authenticateToken, requireSuperAdmin, createUser);

/**
 * @swagger
 * /api/superadmin/users:
 *   get:
 *     summary: Get all users
 *     tags: [SuperAdmin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
SuperAdminRouter.get('/users', authenticateToken, requireSuperAdmin, getUsers);

/**
 * @swagger
 * /api/superadmin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [SuperAdmin - Users]
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
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
SuperAdminRouter.get('/users/:id', authenticateToken, requireSuperAdmin, getUserById);

/**
 * @swagger
 * /api/superadmin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [SuperAdmin - Users]
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
 *               role:
 *                 type: string
 *               branch:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
SuperAdminRouter.put('/users/:id', authenticateToken, requireSuperAdmin, updateUser);

/**
 * @swagger
 * /api/superadmin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [SuperAdmin - Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
SuperAdminRouter.delete('/users/:id', authenticateToken, requireSuperAdmin, deleteUser);

/**
 * @swagger
 * /api/superadmin/mark-attendance:
 *   post:
 *     summary: Mark attendance for any user (any role)
 *     tags: [SuperAdmin - Attendance]
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
 *                 enum: [student, teacher, admin]
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
SuperAdminRouter.post('/mark-attendance', authenticateToken, requireSuperAdmin, markAttendance);

/**
 * @swagger
 * /api/superadmin/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [SuperAdmin - Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Validation error
 */
SuperAdminRouter.post('/branches', authenticateToken, requireSuperAdmin, createBranch);

/**
 * @swagger
 * /api/superadmin/branches:
 *   get:
 *     summary: Get all branches
 *     tags: [SuperAdmin - Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all branches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   location:
 *                     type: string
 */
SuperAdminRouter.get('/branches', authenticateToken, requireSuperAdmin, getBranches);

/**
 * @swagger
 * /api/superadmin/branches/{id}:
 *   get:
 *     summary: Get branch details with admins, teachers, and students
 *     tags: [SuperAdmin - Branches]
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
 *         description: Branch details with users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branch:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 teachers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     adminCount:
 *                       type: number
 *                     teacherCount:
 *                       type: number
 *                     studentCount:
 *                       type: number
 *       404:
 *         description: Branch not found
 */
SuperAdminRouter.get('/branches/:id', authenticateToken, requireSuperAdmin, getBranchById);

/**
 * @swagger
 * /api/superadmin/branches/{id}:
 *   put:
 *     summary: Update branch
 *     tags: [SuperAdmin - Branches]
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
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       404:
 *         description: Branch not found
 */
SuperAdminRouter.put('/branches/:id', authenticateToken, requireSuperAdmin, updateBranch);

/**
 * @swagger
 * /api/superadmin/branches/{id}:
 *   delete:
 *     summary: Delete branch
 *     tags: [SuperAdmin - Branches]
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
 *         description: Branch deleted successfully
 *       400:
 *         description: Branch has users - cannot delete
 *       404:
 *         description: Branch not found
 */
SuperAdminRouter.delete('/branches/:id', authenticateToken, requireSuperAdmin, deleteBranch);

export default SuperAdminRouter;

