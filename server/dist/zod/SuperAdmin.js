"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchSchema = exports.createBranchSchema = exports.changePasswordSchema = exports.assignPermissionSchema = exports.createPermissionSchema = exports.markAttendanceSchema = exports.superAdminLoginSchema = void 0;
const zod_1 = require("zod");
exports.superAdminLoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.markAttendanceSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    date: zod_1.z.string().min(1, 'Date is required'), // ISO string
    status: zod_1.z.enum(['present', 'absent']),
    type: zod_1.z.enum(['student', 'teacher', 'admin']),
});
exports.createPermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Permission name is required'),
    description: zod_1.z.string().optional(),
});
exports.assignPermissionSchema = zod_1.z.object({
    permissionId: zod_1.z.string().min(1, 'Permission ID is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
exports.createBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Branch name is required'),
    location: zod_1.z.string().min(1, 'Location is required'),
});
exports.updateBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Branch name is required').optional(),
    location: zod_1.z.string().min(1, 'Location is required').optional(),
});
