"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.getBranchById = exports.getBranches = exports.createBranch = exports.changePassword = exports.seedDefaultPermissions = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = exports.getUserPermissions = exports.removePermission = exports.assignPermission = exports.getPermissions = exports.createPermission = exports.markAttendance = exports.superAdminLogin = void 0;
const models_1 = require("../../db/models");
const SuperAdmin_1 = require("../../zod/SuperAdmin");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = require("../../db/db");
const drizzle_orm_1 = require("drizzle-orm");
const superAdminLogin = async (req, res) => {
    try {
        const { username, password } = SuperAdmin_1.superAdminLoginSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.username, username), (0, drizzle_orm_1.eq)(models_1.users.role, 'superadmin'))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Assume password is hashed
        const isMatch = user.password ? user.password.length > 8 ? await bcrypt.compare(password, user.password) : password === user.password : false;
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.superAdminLogin = superAdminLogin;
const markAttendance = async (req, res) => {
    try {
        const { userId, date, status, type } = SuperAdmin_1.markAttendanceSchema.parse(req.body);
        // Check if user exists and role matches type
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Superadmin can mark for admin, teacher, student
        if (!['admin', 'teacher', 'student'].includes(user.role)) {
            return res.status(400).json({ message: 'Invalid user type for attendance' });
        }
        // Assume req.user is set by auth middleware
        const markedBy = req.user.id;
        await db_1.db.insert(models_1.attendances).values({
            userId: parseInt(userId),
            date: new Date(date),
            status,
            markedBy: parseInt(markedBy),
            type,
        });
        res.json({ message: 'Attendance marked successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.markAttendance = markAttendance;
const createPermission = async (req, res) => {
    try {
        const { name, description } = SuperAdmin_1.createPermissionSchema.parse(req.body);
        const result = await db_1.db.insert(models_1.permissions).values({ name, description }).returning();
        const permission = result[0];
        res.status(201).json({ message: 'Permission created successfully', permission });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.createPermission = createPermission;
const getPermissions = async (req, res) => {
    try {
        const permissionsList = await db_1.db.select().from(models_1.permissions);
        res.json(permissionsList);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getPermissions = getPermissions;
const assignPermission = async (req, res) => {
    try {
        const { userId } = req.params;
        const { permissionId } = SuperAdmin_1.assignPermissionSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const permissionResult = await db_1.db.select().from(models_1.permissions).where((0, drizzle_orm_1.eq)(models_1.permissions.id, parseInt(permissionId))).limit(1);
        const permission = permissionResult[0];
        if (!permission) {
            return res.status(404).json({ message: 'Permission not found' });
        }
        await db_1.db.insert(models_1.userPermissions).values({ userId: parseInt(userId), permissionId: parseInt(permissionId) });
        res.json({ message: 'Permission assigned successfully' });
    }
    catch (error) {
        // Drizzle will throw error for unique constraint
        res.status(400).json({ message: 'Permission already assigned or validation error', error });
    }
};
exports.assignPermission = assignPermission;
const removePermission = async (req, res) => {
    try {
        const { userId, permissionId } = req.params;
        const result = await db_1.db.delete(models_1.userPermissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.userPermissions.userId, parseInt(userId)), (0, drizzle_orm_1.eq)(models_1.userPermissions.permissionId, parseInt(permissionId))))
            .returning();
        if (result.length === 0) {
            return res.status(404).json({ message: 'Permission not assigned to this user' });
        }
        res.json({ message: 'Permission removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.removePermission = removePermission;
const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const userPerms = await db_1.db.select({
            id: models_1.userPermissions.id,
            permission: models_1.permissions,
        }).from(models_1.userPermissions).leftJoin(models_1.permissions, (0, drizzle_orm_1.eq)(models_1.userPermissions.permissionId, models_1.permissions.id)).where((0, drizzle_orm_1.eq)(models_1.userPermissions.userId, parseInt(userId)));
        res.json(userPerms);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserPermissions = getUserPermissions;
// User Management
const createUser = async (req, res) => {
    try {
        const { username, password, role, branch, name, email, class: className, subject } = req.body;
        // Role-based restrictions
        const currentRole = req.user?.role;
        if (currentRole === 'teacher' && role !== 'student') {
            return res.status(403).json({ message: 'Teachers can only create students' });
        }
        if (currentRole === 'admin' && !['teacher', 'student'].includes(role)) {
            return res.status(403).json({ message: 'Admins can only create teachers and students' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await db_1.db.insert(models_1.users).values({ username, password: hashedPassword, role, branchId: branch ? parseInt(branch) : null }).returning();
        const user = userResult[0];
        if (role === 'teacher') {
            await db_1.db.insert(models_1.teachers).values({ userId: user.id, name, email, subject, branchId: parseInt(branch) });
        }
        else if (role === 'student') {
            await db_1.db.insert(models_1.students).values({ userId: user.id, name, email, class: className, branchId: parseInt(branch) });
        }
        res.status(201).json({ message: 'User created successfully', user });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const currentRole = req.user?.role;
        let usersList;
        if (currentRole === 'teacher') {
            usersList = await db_1.db.select({
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
                branch: models_1.branches,
                createdAt: models_1.users.createdAt,
                updatedAt: models_1.users.updatedAt,
            }).from(models_1.users).leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.users.branchId, models_1.branches.id)).where((0, drizzle_orm_1.eq)(models_1.users.role, 'student'));
        }
        else if (currentRole === 'admin') {
            usersList = await db_1.db.select({
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
                branch: models_1.branches,
                createdAt: models_1.users.createdAt,
                updatedAt: models_1.users.updatedAt,
            }).from(models_1.users).leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.users.branchId, models_1.branches.id)).where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(models_1.users.role, 'teacher'), (0, drizzle_orm_1.eq)(models_1.users.role, 'student')));
        }
        else {
            usersList = await db_1.db.select({
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
                branch: models_1.branches,
                createdAt: models_1.users.createdAt,
                updatedAt: models_1.users.updatedAt,
            }).from(models_1.users).leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.users.branchId, models_1.branches.id));
        }
        res.json(usersList);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const currentRole = req.user?.role;
        const userResult = await db_1.db.select({
            id: models_1.users.id,
            username: models_1.users.username,
            role: models_1.users.role,
            branch: models_1.branches,
            createdAt: models_1.users.createdAt,
            updatedAt: models_1.users.updatedAt,
        }).from(models_1.users).leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.users.branchId, models_1.branches.id)).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(id))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check permissions
        if (currentRole === 'teacher' && user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (currentRole === 'admin' && !['teacher', 'student'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const id = String(req.params.id);
        const updates = req.body;
        const currentRole = req.user?.role;
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(id))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check permissions
        if (currentRole === 'teacher' && user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (currentRole === 'admin' && !['teacher', 'student'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const userUpdates = {};
        if (updates.username)
            userUpdates.username = updates.username;
        if (updates.password)
            userUpdates.password = await bcrypt.hash(updates.password, 10);
        if (updates.role)
            userUpdates.role = updates.role;
        if (updates.branch)
            userUpdates.branchId = parseInt(updates.branch);
        await db_1.db.update(models_1.users).set(userUpdates).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(id)));
        // Update related models
        if (user.role === 'teacher') {
            const teacherUpdates = {};
            if (updates.name)
                teacherUpdates.name = updates.name;
            if (updates.email)
                teacherUpdates.email = updates.email;
            if (updates.subject)
                teacherUpdates.subject = updates.subject;
            if (updates.branch)
                teacherUpdates.branchId = parseInt(updates.branch);
            await db_1.db.update(models_1.teachers).set(teacherUpdates).where((0, drizzle_orm_1.eq)(models_1.teachers.userId, parseInt(id)));
        }
        else if (user.role === 'student') {
            const studentUpdates = {};
            if (updates.name)
                studentUpdates.name = updates.name;
            if (updates.email)
                studentUpdates.email = updates.email;
            if (updates.class)
                studentUpdates.class = updates.class;
            if (updates.branch)
                studentUpdates.branchId = parseInt(updates.branch);
            await db_1.db.update(models_1.students).set(studentUpdates).where((0, drizzle_orm_1.eq)(models_1.students.userId, parseInt(id)));
        }
        res.json({ message: 'User updated successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = String(req.params.id);
        const currentRole = req.user?.role;
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(id))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check permissions
        if (currentRole === 'teacher' && user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (currentRole === 'admin' && !['teacher', 'student'].includes(user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db_1.db.delete(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(id)));
        // Delete related models
        if (user.role === 'teacher') {
            await db_1.db.delete(models_1.teachers).where((0, drizzle_orm_1.eq)(models_1.teachers.userId, parseInt(id)));
        }
        else if (user.role === 'student') {
            await db_1.db.delete(models_1.students).where((0, drizzle_orm_1.eq)(models_1.students.userId, parseInt(id)));
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteUser = deleteUser;
// Seed default permissions
const seedDefaultPermissions = async () => {
    const defaultPermissions = [
        { name: 'can_mark_attendance_all', description: 'Can mark attendance for all roles' },
        { name: 'can_manage_all_roles', description: 'Can manage all user roles' },
        { name: 'can_mark_attendance_teachers_students', description: 'Can mark attendance for teachers and students' },
        { name: 'can_manage_teachers_students', description: 'Can manage teachers and students' },
        { name: 'can_mark_attendance_students', description: 'Can mark attendance for students' },
        { name: 'can_manage_students', description: 'Can manage students' },
    ];
    for (const perm of defaultPermissions) {
        const existing = await db_1.db.select().from(models_1.permissions).where((0, drizzle_orm_1.eq)(models_1.permissions.name, perm.name)).limit(1);
        if (existing.length === 0) {
            await db_1.db.insert(models_1.permissions).values(perm);
        }
    }
    console.log('Default permissions seeded');
};
exports.seedDefaultPermissions = seedDefaultPermissions;
// Change Password
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = SuperAdmin_1.changePasswordSchema.parse(req.body);
        const userId = req.user.id;
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = user.password ? user.password.length > 8 ? await bcrypt.compare(oldPassword, user.password) : oldPassword === user.password : false;
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db_1.db.update(models_1.users).set({ password: hashedPassword }).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId)));
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.changePassword = changePassword;
// Branch Management
const createBranch = async (req, res) => {
    try {
        const { name, location } = SuperAdmin_1.createBranchSchema.parse(req.body);
        const branchResult = await db_1.db.insert(models_1.branches).values({ name, location }).returning();
        const branch = branchResult[0];
        res.status(201).json({ message: 'Branch created successfully', branch });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.createBranch = createBranch;
const getBranches = async (req, res) => {
    try {
        const branchesList = await db_1.db.select().from(models_1.branches);
        res.json(branchesList);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getBranches = getBranches;
const getBranchById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const branchResult = await db_1.db.select().from(models_1.branches).where((0, drizzle_orm_1.eq)(models_1.branches.id, parseInt(id))).limit(1);
        const branch = branchResult[0];
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        // Get all users in this branch
        const admins = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.branchId, parseInt(id)), (0, drizzle_orm_1.eq)(models_1.users.role, 'admin')));
        const teachers = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.branchId, parseInt(id)), (0, drizzle_orm_1.eq)(models_1.users.role, 'teacher')));
        const students = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.branchId, parseInt(id)), (0, drizzle_orm_1.eq)(models_1.users.role, 'student')));
        res.json({
            branch,
            admins,
            teachers,
            students,
            summary: { adminCount: admins.length, teacherCount: teachers.length, studentCount: students.length },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getBranchById = getBranchById;
const updateBranch = async (req, res) => {
    try {
        const id = String(req.params.id);
        const updates = SuperAdmin_1.updateBranchSchema.parse(req.body);
        const branchResult = await db_1.db.update(models_1.branches).set(updates).where((0, drizzle_orm_1.eq)(models_1.branches.id, parseInt(id))).returning();
        const branch = branchResult[0];
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        res.json({ message: 'Branch updated successfully', branch });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res) => {
    try {
        const id = String(req.params.id);
        // Check if branch has any users
        const usersInBranch = await db_1.db.$count(models_1.users, (0, drizzle_orm_1.eq)(models_1.users.branchId, parseInt(id)));
        if (usersInBranch > 0) {
            return res.status(400).json({ message: 'Cannot delete branch with users. Remove all users first.' });
        }
        await db_1.db.delete(models_1.branches).where((0, drizzle_orm_1.eq)(models_1.branches.id, parseInt(id)));
        res.json({ message: 'Branch deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteBranch = deleteBranch;
