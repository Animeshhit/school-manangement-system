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
exports.markAttendance = exports.teacherLogin = void 0;
const db_1 = require("../../db/db");
const models_1 = require("../../db/models");
const drizzle_orm_1 = require("drizzle-orm");
const SuperAdmin_1 = require("../../zod/SuperAdmin"); // Reuse
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const teacherLogin = async (req, res) => {
    try {
        const { username, password } = SuperAdmin_1.superAdminLoginSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.username, username), (0, drizzle_orm_1.eq)(models_1.users.role, 'teacher'))).limit(1);
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
exports.teacherLogin = teacherLogin;
const markAttendance = async (req, res) => {
    try {
        const { userId, date, status, type } = SuperAdmin_1.markAttendanceSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.eq)(models_1.users.id, parseInt(userId))).limit(1);
        const user = userResult[0];
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Teacher can mark for student only
        if (user.role !== 'student') {
            return res.status(400).json({ message: 'Teachers can only mark student attendance' });
        }
        const markedBy = req.user.id;
        const targetUserId = parseInt(userId);
        await db_1.db.insert(models_1.attendances).values({
            userId: targetUserId,
            date: new Date(date),
            status,
            markedBy,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        res.json({ message: 'Attendance marked successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};
exports.markAttendance = markAttendance;
