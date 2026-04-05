"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SuperAdminControllers_1 = require("../controllers/SuperAdmin/SuperAdminControllers");
const auth_1 = require("../middleware/auth");
const PermissionRouter = (0, express_1.Router)();
// Apply authentication and superadmin check to all permission routes
PermissionRouter.use(auth_1.authenticateToken);
PermissionRouter.use(auth_1.requireSuperAdmin);
/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Validation error
 */
PermissionRouter.post('/', SuperAdminControllers_1.createPermission);
/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
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
 *                   description:
 *                     type: string
 */
PermissionRouter.get('/', SuperAdminControllers_1.getPermissions);
/**
 * @swagger
 * /api/permissions/users/{userId}:
 *   post:
 *     summary: Assign a permission to a user
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission assigned successfully
 *       400:
 *         description: Validation error or permission already assigned
 *       404:
 *         description: User or permission not found
 */
PermissionRouter.post('/users/:userId', SuperAdminControllers_1.assignPermission);
/**
 * @swagger
 * /api/permissions/users/{userId}/{permissionId}:
 *   delete:
 *     summary: Remove a permission from a user
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *       - in: path
 *         name: permissionId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       404:
 *         description: Permission not assigned to this user
 */
PermissionRouter.delete('/users/:userId/:permissionId', SuperAdminControllers_1.removePermission);
/**
 * @swagger
 * /api/permissions/users/{userId}:
 *   get:
 *     summary: Get permissions assigned to a user
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user permissions
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
 *                   permission:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 */
PermissionRouter.get('/users/:userId', SuperAdminControllers_1.getUserPermissions);
exports.default = PermissionRouter;
