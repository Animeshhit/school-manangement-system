import { Request, Response } from 'express';
import { db } from '../../db/db';
import { users, attendances, teachers, students, branches } from '../../db/models';
import { eq, and, sql } from 'drizzle-orm';
import { superAdminLoginSchema, markAttendanceSchema } from '../../zod/SuperAdmin'; // Reuse schemas
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../../middleware/auth';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = superAdminLoginSchema.parse(req.body);

    const userResult = await db.select().from(users).where(and(eq(users.username, username), eq(users.role, 'admin'))).limit(1);
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
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { userId, date, status, type } = markAttendanceSchema.parse(req.body);

    const userResult = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin can mark for teacher, student
    if (!['teacher', 'student'].includes(user.role)) {
      return res.status(400).json({ message: 'Invalid user type for attendance' });
    }

    const markedBy = (req as any).user.id;

    await db.insert(attendances).values({
      userId: parseInt(userId),
      date: new Date(date),
      status,
      markedBy,
      type,
    });

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

// Teacher Management
// cases : 

 // case 1 : wants to create a teacher without branch 
 // case 2 : wants to create a teacher with branch (admin can only create teachers in their branch)
export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, email, subject, branch } = req.body;
    // got adminbranch i think it will be undefined if it is superadmin 
    const adminBranch = String((req as any).user.branch);
    const branchId = branch ? String(branch) : undefined;


    

    // Admin can only create teachers in their branch
    if (adminBranch != undefined && adminBranch !== branchId) {
      return res.status(403).json({ message: 'Can only create users in your branch' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await db.insert(users).values({
      username,
      password: hashedPassword,
      role: 'teacher',
      branchId: branchId ? parseInt(branchId) : null,
    }).returning({ id: users.id });

    const userId = userResult[0].id;

    const teacherResult = await db.insert(teachers).values({
      userId,
      name,
      email,
      subject,
      branchId: branchId ? parseInt(branchId) : null,
    }).returning();

    res.status(201).json({ message: 'Teacher created successfully', teacher: teacherResult[0] });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const teachersData = await db.select({
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
      subject: teachers.subject,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
      branch: {
        id: branches.id,
        name: branches.name,
        location: branches.location,
      },
    }).from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(adminBranch ? eq(teachers.branchId, adminBranch) : sql`true`);

    res.json(teachersData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const teacherData = await db.select({
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
      subject: teachers.subject,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
      branch: {
        id: branches.id,
        name: branches.name,
        location: branches.location,
      },
    }).from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .leftJoin(branches, eq(teachers.branchId, branches.id))
      .where(and(eq(teachers.id, parseInt(id)), adminBranch ? eq(teachers.branchId, adminBranch) : sql`true`))
      .limit(1);

    if (teacherData.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacherData[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { username, password, name, email, subject } = req.body;
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const teacherData = await db.select({
      id: teachers.id,
      userId: teachers.userId,
      branchId: teachers.branchId,
    }).from(teachers).where(eq(teachers.id, parseInt(id))).limit(1);

    if (teacherData.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacher = teacherData[0];

    if (adminBranch && teacher.branchId !== adminBranch) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (subject) updates.subject = subject;

    const userUpdates: any = {};
    if (username) userUpdates.username = username;
    if (password) userUpdates.password = await bcrypt.hash(password, 10);

    if (Object.keys(updates).length > 0) {
      await db.update(teachers).set(updates).where(eq(teachers.id, parseInt(id)));
    }
    if (Object.keys(userUpdates).length > 0) {
      await db.update(users).set(userUpdates).where(eq(users.id, teacher.userId));
    }

    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const teacherData = await db.select({
      id: teachers.id,
      userId: teachers.userId,
      branchId: teachers.branchId,
    }).from(teachers).where(eq(teachers.id, parseInt(id))).limit(1);

    if (teacherData.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacher = teacherData[0];

    if (adminBranch && teacher.branchId !== adminBranch) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.delete(users).where(eq(users.id, teacher.userId));
    await db.delete(teachers).where(eq(teachers.id, parseInt(id)));

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Student Management
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, email, class: className, branch } = req.body;
    const adminBranch = String((req as any).user.branch);
    const branchId = String(branch);

    // Admin can only create students in their branch
    if (adminBranch && adminBranch !== branchId) {
      return res.status(403).json({ message: 'Can only create users in your branch' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await db.insert(users).values({
      username,
      password: hashedPassword,
      role: 'student',
      branchId: parseInt(branchId),
    }).returning({ id: users.id });

    const userId = userResult[0].id;

    const studentResult = await db.insert(students).values({
      userId,
      name,
      email,
      class: className,
      branchId: parseInt(branchId),
    }).returning();

    res.status(201).json({ message: 'Student created successfully', student: studentResult[0] });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const studentsData = await db.select({
      id: students.id,
      name: students.name,
      email: students.email,
      class: students.class,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
      branch: {
        id: branches.id,
        name: branches.name,
        location: branches.location,
      },
    }).from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(branches, eq(students.branchId, branches.id))
      .where(adminBranch ? eq(students.branchId, adminBranch) : sql`true`);

    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const studentData = await db.select({
      id: students.id,
      name: students.name,
      email: students.email,
      class: students.class,
      user: {
        id: users.id,
        username: users.username,
        role: users.role,
      },
      branch: {
        id: branches.id,
        name: branches.name,
        location: branches.location,
      },
    }).from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(branches, eq(students.branchId, branches.id))
      .where(and(eq(students.id, parseInt(id)), adminBranch ? eq(students.branchId, adminBranch) : sql`true`))
      .limit(1);

    if (studentData.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(studentData[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { username, password, name, email, class: className } = req.body;
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const studentData = await db.select({
      id: students.id,
      userId: students.userId,
      branchId: students.branchId,
    }).from(students).where(eq(students.id, parseInt(id))).limit(1);

    if (studentData.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentData[0];

    if (adminBranch && student.branchId !== adminBranch) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (className) updates.class = className;

    const userUpdates: any = {};
    if (username) userUpdates.username = username;
    if (password) userUpdates.password = await bcrypt.hash(password, 10);

    if (Object.keys(updates).length > 0) {
      await db.update(students).set(updates).where(eq(students.id, parseInt(id)));
    }
    if (Object.keys(userUpdates).length > 0) {
      await db.update(users).set(userUpdates).where(eq(users.id, student.userId));
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const adminBranch = (req as any).user.branch ? parseInt(String((req as any).user.branch)) : undefined;

    const studentData = await db.select({
      id: students.id,
      userId: students.userId,
      branchId: students.branchId,
    }).from(students).where(eq(students.id, parseInt(id))).limit(1);

    if (studentData.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = studentData[0];

    if (adminBranch && student.branchId !== adminBranch) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.delete(users).where(eq(users.id, student.userId));
    await db.delete(students).where(eq(students.id, parseInt(id)));

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};