import { Request, Response } from 'express';
import { users, attendances, permissions, userPermissions, branches, teachers, students } from '../../db/models';
import { superAdminLoginSchema, markAttendanceSchema, createPermissionSchema, assignPermissionSchema, changePasswordSchema, createBranchSchema, updateBranchSchema } from '../../zod/SuperAdmin';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../../middleware/auth';
import { db } from '../../db/db';
import { eq, and, or } from 'drizzle-orm';

export const superAdminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = superAdminLoginSchema.parse(req.body);

    const userResult = await db.select().from(users).where(and(eq(users.username, username), eq(users.role, 'superadmin'))).limit(1);
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
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { userId, date, status, type } = markAttendanceSchema.parse(req.body);

    // Check if user exists and role matches type
    const userResult = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Superadmin can mark for admin, teacher, student
    if (!['admin', 'teacher', 'student'].includes(user.role)) {
      return res.status(400).json({ message: 'Invalid user type for attendance' });
    }

    // Assume req.user is set by auth middleware
    const markedBy = (req as any).user.id;

    await db.insert(attendances).values({
      userId: parseInt(userId),
      date: new Date(date),
      status,
      markedBy: parseInt(markedBy),
      type,
    });

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, description } = createPermissionSchema.parse(req.body);

    const result = await db.insert(permissions).values({ name, description }).returning();
    const permission = result[0];

    res.status(201).json({ message: 'Permission created successfully', permission });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissionsList = await db.select().from(permissions);
    res.json(permissionsList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const assignPermission = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { permissionId } = assignPermissionSchema.parse(req.body);

    const userResult = await db.select().from(users).where(eq(users.id, parseInt(userId as string))).limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const permissionResult = await db.select().from(permissions).where(eq(permissions.id, parseInt(permissionId as string))).limit(1);
    const permission = permissionResult[0];
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    await db.insert(userPermissions).values({ userId: parseInt(userId as string), permissionId: parseInt(permissionId as string) });

    res.json({ message: 'Permission assigned successfully' });
  } catch (error) {
    // Drizzle will throw error for unique constraint
    res.status(400).json({ message: 'Permission already assigned or validation error', error });
  }
};

export const removePermission = async (req: Request, res: Response) => {
  try {
    const { userId, permissionId } = req.params;

    const result = await db.delete(userPermissions)
      .where(and(eq(userPermissions.userId, parseInt(userId as string)), eq(userPermissions.permissionId, parseInt(permissionId as string))))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ message: 'Permission not assigned to this user' });
    }

    res.json({ message: 'Permission removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userPerms = await db.select({
      id: userPermissions.id,
      permission: permissions,
    }).from(userPermissions).leftJoin(permissions, eq(userPermissions.permissionId, permissions.id)).where(eq(userPermissions.userId, parseInt(userId as string)));
    res.json(userPerms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// User Management
export const createUser = async (req: AuthRequest, res: Response) => {
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
    const userResult = await db.insert(users).values({ username, password: hashedPassword, role, branchId: branch ? parseInt(branch) : null }).returning();
    const user = userResult[0];

    if (role === 'teacher') {
      await db.insert(teachers).values({ userId: user.id, name, email, subject, branchId: parseInt(branch) });
    } else if (role === 'student') {
      await db.insert(students).values({ userId: user.id, name, email, class: className, branchId: parseInt(branch) });
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentRole = req.user?.role;
    let usersList;

    if (currentRole === 'teacher') {
      usersList = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        branch: branches,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users).leftJoin(branches, eq(users.branchId, branches.id)).where(eq(users.role, 'student'));
    } else if (currentRole === 'admin') {
      usersList = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        branch: branches,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users).leftJoin(branches, eq(users.branchId, branches.id)).where(or(eq(users.role, 'teacher'), eq(users.role, 'student')));
    } else {
      usersList = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        branch: branches,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users).leftJoin(branches, eq(users.branchId, branches.id));
    }

    res.json(usersList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const currentRole = req.user?.role;

    const userResult = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      branch: branches,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).leftJoin(branches, eq(users.branchId, branches.id)).where(eq(users.id, parseInt(id))).limit(1);
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;
    const currentRole = req.user?.role;

    const userResult = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
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

    const userUpdates: any = {};
    if (updates.username) userUpdates.username = updates.username;
    if (updates.password) userUpdates.password = await bcrypt.hash(updates.password, 10);
    if (updates.role) userUpdates.role = updates.role;
    if (updates.branch) userUpdates.branchId = parseInt(updates.branch);

    await db.update(users).set(userUpdates).where(eq(users.id, parseInt(id)));

    // Update related models
    if (user.role === 'teacher') {
      const teacherUpdates: any = {};
      if (updates.name) teacherUpdates.name = updates.name;
      if (updates.email) teacherUpdates.email = updates.email;
      if (updates.subject) teacherUpdates.subject = updates.subject;
      if (updates.branch) teacherUpdates.branchId = parseInt(updates.branch);
      await db.update(teachers).set(teacherUpdates).where(eq(teachers.userId, parseInt(id)));
    } else if (user.role === 'student') {
      const studentUpdates: any = {};
      if (updates.name) studentUpdates.name = updates.name;
      if (updates.email) studentUpdates.email = updates.email;
      if (updates.class) studentUpdates.class = updates.class;
      if (updates.branch) studentUpdates.branchId = parseInt(updates.branch);
      await db.update(students).set(studentUpdates).where(eq(students.userId, parseInt(id)));
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const currentRole = req.user?.role;

    const userResult = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
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

    await db.delete(users).where(eq(users.id, parseInt(id)));

    // Delete related models
    if (user.role === 'teacher') {
      await db.delete(teachers).where(eq(teachers.userId, parseInt(id)));
    } else if (user.role === 'student') {
      await db.delete(students).where(eq(students.userId, parseInt(id)));
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Seed default permissions
export const seedDefaultPermissions = async () => {
  const defaultPermissions = [
    { name: 'can_mark_attendance_all', description: 'Can mark attendance for all roles' },
    { name: 'can_manage_all_roles', description: 'Can manage all user roles' },
    { name: 'can_mark_attendance_teachers_students', description: 'Can mark attendance for teachers and students' },
    { name: 'can_manage_teachers_students', description: 'Can manage teachers and students' },
    { name: 'can_mark_attendance_students', description: 'Can mark attendance for students' },
    { name: 'can_manage_students', description: 'Can manage students' },
  ];

  for (const perm of defaultPermissions) {
    const existing = await db.select().from(permissions).where(eq(permissions.name, perm.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(permissions).values(perm);
    }
  }
  console.log('Default permissions seeded');
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user.id;

    const userResult = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = user.password ? user.password.length > 8 ? await bcrypt.compare(oldPassword, user.password) : oldPassword === user.password : false;
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, parseInt(userId)));

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

// Branch Management
export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location } = createBranchSchema.parse(req.body);

    const branchResult = await db.insert(branches).values({ name, location }).returning();
    const branch = branchResult[0];

    res.status(201).json({ message: 'Branch created successfully', branch });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const getBranches = async (req: AuthRequest, res: Response) => {
  try {
    const branchesList = await db.select().from(branches);
    res.json(branchesList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBranchById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const branchResult = await db.select().from(branches).where(eq(branches.id, parseInt(id))).limit(1);
    const branch = branchResult[0];
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Get all users in this branch
    const admins = await db.select().from(users).where(and(eq(users.branchId, parseInt(id)), eq(users.role, 'admin')));
    const teachers = await db.select().from(users).where(and(eq(users.branchId, parseInt(id)), eq(users.role, 'teacher')));
    const students = await db.select().from(users).where(and(eq(users.branchId, parseInt(id)), eq(users.role, 'student')));

    res.json({
      branch,
      admins,
      teachers,
      students,
      summary: { adminCount: admins.length, teacherCount: teachers.length, studentCount: students.length },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateBranch = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = updateBranchSchema.parse(req.body);

    const branchResult = await db.update(branches).set(updates).where(eq(branches.id, parseInt(id))).returning();
    const branch = branchResult[0];
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({ message: 'Branch updated successfully', branch });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    // Check if branch has any users
    const usersInBranch = await db.$count(users, eq(users.branchId, parseInt(id)));
    if (usersInBranch > 0) {
      return res.status(400).json({ message: 'Cannot delete branch with users. Remove all users first.' });
    }

    await db.delete(branches).where(eq(branches.id, parseInt(id)));

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};