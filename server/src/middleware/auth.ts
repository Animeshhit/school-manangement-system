import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin access required' });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['admin', 'superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireTeacher = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['teacher', 'admin', 'superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Teacher access required' });
  }
  next();
};

export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['student', 'teacher', 'admin', 'superadmin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

export const requireNonStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['superadmin', 'admin', 'teacher'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied: Students cannot perform this action' });
  }
  next();
};