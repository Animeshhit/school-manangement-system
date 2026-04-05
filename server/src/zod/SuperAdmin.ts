import { z } from 'zod';

export const superAdminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const markAttendanceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().min(1, 'Date is required'), // ISO string
  status: z.enum(['present', 'absent']),
  type: z.enum(['student', 'teacher', 'admin']),
});

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
});

export const assignPermissionSchema = z.object({
  permissionId: z.string().min(1, 'Permission ID is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  location: z.string().min(1, 'Location is required'),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
});