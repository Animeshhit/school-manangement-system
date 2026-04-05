import { Request, Response } from 'express';
import { db } from '../../db/db';
import { users, attendances } from '../../db/models';
import { eq, and } from 'drizzle-orm';
import { superAdminLoginSchema, markAttendanceSchema } from '../../zod/SuperAdmin'; // Reuse
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export const teacherLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = superAdminLoginSchema.parse(req.body);

    const userResult = await db.select().from(users).where(and(eq(users.username, username), eq(users.role, 'teacher'))).limit(1);
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

    // Teacher can mark for student only
    if (user.role !== 'student') {
      return res.status(400).json({ message: 'Teachers can only mark student attendance' });
    }

    const markedBy = (req as any).user.id;
    const targetUserId = parseInt(userId);

    await db.insert(attendances).values({
      userId: targetUserId,
      date: new Date(date),
      status,
      markedBy,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};