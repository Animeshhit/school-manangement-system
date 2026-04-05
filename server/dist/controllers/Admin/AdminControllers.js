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
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = exports.deleteTeacher = exports.updateTeacher = exports.getTeacherById = exports.getTeachers = exports.createTeacher = exports.markAttendance = exports.adminLogin = void 0;
const db_1 = require("../../db/db");
const models_1 = require("../../db/models");
const drizzle_orm_1 = require("drizzle-orm");
const SuperAdmin_1 = require("../../zod/SuperAdmin"); // Reuse schemas
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const adminLogin = async (req, res) => {
    try {
        const { username, password } = SuperAdmin_1.superAdminLoginSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.username, username), (0, drizzle_orm_1.eq)(models_1.users.role, 'admin'))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.adminLogin = adminLogin;
const markAttendance = async (req, res) => {
    try {
        const { userId, date, status, type } = SuperAdmin_1.markAttendanceSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Admin can mark for teacher, student
        if (!['teacher', 'student'].includes(user.role)) {
            return res.status(400).json({ message: 'Invalid user type for attendance' });
        }
        const markedBy = req.user.id;
        await db_1.db.insert(models_1.attendances).values({
            userId: parseInt(userId),
            date: new Date(date),
            status,
            markedBy,
            type,
        });
        res.json({ message: 'Attendance marked successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.markAttendance = markAttendance;
// Teacher Management
const createTeacher = async (req, res) => {
    try {
        const { username, password, name, email, subject, branch } = req.body;
        const adminBranch = String(req.user.branch);
        const branchId = String(branch);
        // Admin can only create teachers in their branch
        if (adminBranch && adminBranch !== branchId) {
            return res.status(403).json({ message: 'Can only create users in your branch' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await db_1.db.insert(models_1.users).values({
            username,
            password: hashedPassword,
            role: 'teacher',
            branchId: branchId ? parseInt(branchId) : null,
        }).returning({ id: models_1.users.id });
        const userId = userResult[0].id;
        const teacherResult = await db_1.db.insert(models_1.teachers).values({
            userId,
            name,
            email,
            subject,
            branchId: branchId ? parseInt(branchId) : null,
        }).returning();
        res.status(201).json({ message: 'Teacher created successfully', teacher: teacherResult[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.createTeacher = createTeacher;
const getTeachers = async (req, res) => {
    try {
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const teachersData = await db_1.db.select({
            id: models_1.teachers.id,
            name: models_1.teachers.name,
            email: models_1.teachers.email,
            subject: models_1.teachers.subject,
            user: {
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
            },
            branch: {
                id: models_1.branches.id,
                name: models_1.branches.name,
                location: models_1.branches.location,
            },
        }).from(models_1.teachers)
            .leftJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.teachers.userId, models_1.users.id))
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.teachers.branchId, models_1.branches.id))
            .where(adminBranch ? (0, drizzle_orm_1.eq)(models_1.teachers.branchId, adminBranch) : (0, drizzle_orm_1.sql) `true`);
        res.json(teachersData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTeachers = getTeachers;
const getTeacherById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const teacherData = await db_1.db.select({
            id: models_1.teachers.id,
            name: models_1.teachers.name,
            email: models_1.teachers.email,
            subject: models_1.teachers.subject,
            user: {
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
            },
            branch: {
                id: models_1.branches.id,
                name: models_1.branches.name,
                location: models_1.branches.location,
            },
        }).from(models_1.teachers)
            .leftJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.teachers.userId, models_1.users.id))
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.teachers.branchId, models_1.branches.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.teachers.id, parseInt(id)), adminBranch ? (0, drizzle_orm_1.eq)(models_1.teachers.branchId, adminBranch) : (0, drizzle_orm_1.sql) `true`))
            .limit(1);
        if (teacherData.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacherData[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getTeacherById = getTeacherById;
const updateTeacher = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { username, password, name, email, subject } = req.body;
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const teacherData = await db_1.db.select({
            id: models_1.teachers.id,
            userId: models_1.teachers.userId,
            branchId: models_1.teachers.branchId,
        }).from(models_1.teachers).where((0, drizzle_orm_1.eq)(models_1.teachers.id, parseInt(id))).limit(1);
        if (teacherData.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const teacher = teacherData[0];
        if (adminBranch && teacher.branchId !== adminBranch) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updates = {};
        if (name)
            updates.name = name;
        if (email)
            updates.email = email;
        if (subject)
            updates.subject = subject;
        const userUpdates = {};
        if (username)
            userUpdates.username = username;
        if (password)
            userUpdates.password = await bcrypt.hash(password, 10);
        if (Object.keys(updates).length > 0) {
            await db_1.db.update(models_1.teachers).set(updates).where((0, drizzle_orm_1.eq)(models_1.teachers.id, parseInt(id)));
        }
        if (Object.keys(userUpdates).length > 0) {
            await db_1.db.update(models_1.users).set(userUpdates).where((0, drizzle_orm_1.eq)(models_1.users.id, teacher.userId));
        }
        res.json({ message: 'Teacher updated successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.updateTeacher = updateTeacher;
const deleteTeacher = async (req, res) => {
    try {
        const id = String(req.params.id);
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const teacherData = await db_1.db.select({
            id: models_1.teachers.id,
            userId: models_1.teachers.userId,
            branchId: models_1.teachers.branchId,
        }).from(models_1.teachers).where((0, drizzle_orm_1.eq)(models_1.teachers.id, parseInt(id))).limit(1);
        if (teacherData.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const teacher = teacherData[0];
        if (adminBranch && teacher.branchId !== adminBranch) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db_1.db.delete(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, teacher.userId));
        await db_1.db.delete(models_1.teachers).where((0, drizzle_orm_1.eq)(models_1.teachers.id, parseInt(id)));
        res.json({ message: 'Teacher deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteTeacher = deleteTeacher;
// Student Management
const createStudent = async (req, res) => {
    try {
        const { username, password, name, email, class: className, branch } = req.body;
        const adminBranch = String(req.user.branch);
        const branchId = String(branch);
        // Admin can only create students in their branch
        if (adminBranch && adminBranch !== branchId) {
            return res.status(403).json({ message: 'Can only create users in your branch' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await db_1.db.insert(models_1.users).values({
            username,
            password: hashedPassword,
            role: 'student',
            branchId: parseInt(branchId),
        }).returning({ id: models_1.users.id });
        const userId = userResult[0].id;
        const studentResult = await db_1.db.insert(models_1.students).values({
            userId,
            name,
            email,
            class: className,
            branchId: parseInt(branchId),
        }).returning();
        res.status(201).json({ message: 'Student created successfully', student: studentResult[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.createStudent = createStudent;
const getStudents = async (req, res) => {
    try {
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const studentsData = await db_1.db.select({
            id: models_1.students.id,
            name: models_1.students.name,
            email: models_1.students.email,
            class: models_1.students.class,
            user: {
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
            },
            branch: {
                id: models_1.branches.id,
                name: models_1.branches.name,
                location: models_1.branches.location,
            },
        }).from(models_1.students)
            .leftJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.students.userId, models_1.users.id))
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.students.branchId, models_1.branches.id))
            .where(adminBranch ? (0, drizzle_orm_1.eq)(models_1.students.branchId, adminBranch) : (0, drizzle_orm_1.sql) `true`);
        res.json(studentsData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudents = getStudents;
const getStudentById = async (req, res) => {
    try {
        const id = String(req.params.id);
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const studentData = await db_1.db.select({
            id: models_1.students.id,
            name: models_1.students.name,
            email: models_1.students.email,
            class: models_1.students.class,
            user: {
                id: models_1.users.id,
                username: models_1.users.username,
                role: models_1.users.role,
            },
            branch: {
                id: models_1.branches.id,
                name: models_1.branches.name,
                location: models_1.branches.location,
            },
        }).from(models_1.students)
            .leftJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.students.userId, models_1.users.id))
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.students.branchId, models_1.branches.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.students.id, parseInt(id)), adminBranch ? (0, drizzle_orm_1.eq)(models_1.students.branchId, adminBranch) : (0, drizzle_orm_1.sql) `true`))
            .limit(1);
        if (studentData.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(studentData[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStudentById = getStudentById;
const updateStudent = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { username, password, name, email, class: className } = req.body;
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const studentData = await db_1.db.select({
            id: models_1.students.id,
            userId: models_1.students.userId,
            branchId: models_1.students.branchId,
        }).from(models_1.students).where((0, drizzle_orm_1.eq)(models_1.students.id, parseInt(id))).limit(1);
        if (studentData.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const student = studentData[0];
        if (adminBranch && student.branchId !== adminBranch) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updates = {};
        if (name)
            updates.name = name;
        if (email)
            updates.email = email;
        if (className)
            updates.class = className;
        const userUpdates = {};
        if (username)
            userUpdates.username = username;
        if (password)
            userUpdates.password = await bcrypt.hash(password, 10);
        if (Object.keys(updates).length > 0) {
            await db_1.db.update(models_1.students).set(updates).where((0, drizzle_orm_1.eq)(models_1.students.id, parseInt(id)));
        }
        if (Object.keys(userUpdates).length > 0) {
            await db_1.db.update(models_1.users).set(userUpdates).where((0, drizzle_orm_1.eq)(models_1.users.id, student.userId));
        }
        res.json({ message: 'Student updated successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const id = String(req.params.id);
        const adminBranch = req.user.branch ? parseInt(String(req.user.branch)) : undefined;
        const studentData = await db_1.db.select({
            id: models_1.students.id,
            userId: models_1.students.userId,
            branchId: models_1.students.branchId,
        }).from(models_1.students).where((0, drizzle_orm_1.eq)(models_1.students.id, parseInt(id))).limit(1);
        if (studentData.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const student = studentData[0];
        if (adminBranch && student.branchId !== adminBranch) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db_1.db.delete(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, student.userId));
        await db_1.db.delete(models_1.students).where((0, drizzle_orm_1.eq)(models_1.students.id, parseInt(id)));
        res.json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteStudent = deleteStudent;
