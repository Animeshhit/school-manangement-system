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
exports.getAttendance = exports.studentLogin = void 0;
const db_1 = require("../../db/db");
const models_1 = require("../../db/models");
const drizzle_orm_1 = require("drizzle-orm");
const SuperAdmin_1 = require("../../zod/SuperAdmin"); // Reuse
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const studentLogin = async (req, res) => {
    try {
        const { username, password } = SuperAdmin_1.superAdminLoginSchema.parse(req.body);
        const userResult = await db_1.db.select().from(models_1.users).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.users.username, username), (0, drizzle_orm_1.eq)(models_1.users.role, 'student'))).limit(1);
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
exports.studentLogin = studentLogin;
const getAttendance = async (req, res) => {
    try {
        const userId = req.user.id; // From auth
        const attendance = await db_1.db.select({
            id: models_1.attendances.id,
            date: models_1.attendances.date,
            status: models_1.attendances.status,
            type: models_1.attendances.type,
            markedBy: {
                username: models_1.users.username
            }
        }).from(models_1.attendances).leftJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.attendances.markedBy, models_1.users.id)).where((0, drizzle_orm_1.eq)(models_1.attendances.userId, userId));
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAttendance = getAttendance;
