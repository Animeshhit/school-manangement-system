import { Request, Response } from 'express';
import { db } from '../../db/db';
import { users, attendances } from '../../db/models';
import { eq, and } from 'drizzle-orm';
import { superAdminLoginSchema } from '../../zod/SuperAdmin'; // Reuse
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export const studentLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = superAdminLoginSchema.parse(req.body);

    const userResult = await db.select().from(users).where(and(eq(users.username, username), eq(users.role, 'student'))).limit(1);
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

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // From auth

    const attendance = await db.select({
      id: attendances.id,
      date: attendances.date,
      status: attendances.status,
      type: attendances.type,
      markedBy: {
        username: users.username
      }
    }).from(attendances).leftJoin(users, eq(attendances.markedBy, users.id)).where(eq(attendances.userId, userId));
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};