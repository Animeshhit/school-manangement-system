import { Request, Response } from 'express';
import { db } from '../../db/db';
import { fees, studentFeePayments, students, branches } from '../../db/models';
import { eq, and, desc } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

// Zod schemas
const createFeeSchema = z.object({
  branch: z.string().min(1, 'Branch ID is required'),
  class: z.string().min(1, 'Class is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Invalid date format'),
});

const updateFeeSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  dueDate: z.string().datetime('Invalid date format').optional(),
});

const markFeePaymentSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  fee: z.string().min(1, 'Fee ID is required'),
  status: z.enum(['paid', 'pending']).optional(),
  paidDate: z.string().datetime('Invalid date format').optional().nullable(),
});

// Create Fee for Class (Superadmin, Admin, Teacher only)
export const createFee = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createFeeSchema.parse(req.body);

    const branchResult = await db.select().from(branches).where(eq(branches.id, parseInt(validatedData.branch))).limit(1);
    if (branchResult.length === 0) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if fee already exists for this class in this branch
    const existingFee = await db.select().from(fees).where(and(eq(fees.branchId, parseInt(validatedData.branch)), eq(fees.class, validatedData.class))).limit(1);
    if (existingFee.length > 0) {
      return res.status(400).json({ message: 'Fee already exists for this class in this branch' });
    }

    const feeResult = await db.insert(fees).values({
      branchId: parseInt(validatedData.branch),
      class: validatedData.class,
      amount: validatedData.amount.toString(), // numeric is string
      dueDate: new Date(validatedData.dueDate),
    }).returning();

    const fee = feeResult[0];

    // Get all students in this class and branch
    const studentsInClass = await db.select().from(students).where(and(eq(students.class, validatedData.class), eq(students.branchId, parseInt(validatedData.branch))));

    // Create StudentFeePayment records for all students in the class
    if (studentsInClass.length > 0) {
      const feePayments = studentsInClass.map(student => ({
        studentId: student.id,
        feeId: fee.id,
        status: 'pending',
      }));
      await db.insert(studentFeePayments).values(feePayments);
    }

    res.status(201).json({
      message: 'Fee created successfully and assigned to all students in this class',
      fee,
      studentsAssigned: studentsInClass.length,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update Fee (Superadmin, Admin, Teacher only)
export const updateFee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateFeeSchema.parse(req.body);

    const updates: any = {};
    if (validatedData.amount) updates.amount = validatedData.amount.toString();
    if (validatedData.dueDate) updates.dueDate = new Date(validatedData.dueDate);

    const feeResult = await db.update(fees).set(updates).where(eq(fees.id, parseInt(id as string))).returning();

    if (feeResult.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({ message: 'Fee updated successfully', fee: feeResult[0] });
  } catch (error: any) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete Fee (Superadmin, Admin, Teacher only)
export const deleteFee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const feeResult = await db.delete(fees).where(eq(fees.id, parseInt(id as string))).returning();

    if (feeResult.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    // Delete all student fee payments for this fee
    await db.delete(studentFeePayments).where(eq(studentFeePayments.feeId, parseInt(id as string)));

    res.json({ message: 'Fee deleted successfully and removed from all students' });
  } catch (error: any) {
    res.status(400).json({ message: 'Error deleting fee', error: error.message });
  }
};

// View All Fees (All roles)
export const viewAllFees = async (req: AuthRequest, res: Response) => {
  try {
    const feesData = await db.select({
      id: fees.id,
      branchId: fees.branchId,
      class: fees.class,
      amount: fees.amount,
      dueDate: fees.dueDate,
      createdAt: fees.createdAt,
      updatedAt: fees.updatedAt,
      branch: {
        name: branches.name,
      },
    }).from(fees)
      .leftJoin(branches, eq(fees.branchId, branches.id))
      .orderBy(desc(fees.createdAt));

    res.json({ message: 'Fees retrieved successfully', count: feesData.length, fees: feesData });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving fees', error: error.message });
  }
};

// View Fee by ID (All roles)
export const viewFeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const feeData = await db.select({
      id: fees.id,
      branchId: fees.branchId,
      class: fees.class,
      amount: fees.amount,
      dueDate: fees.dueDate,
      createdAt: fees.createdAt,
      updatedAt: fees.updatedAt,
      branch: {
        name: branches.name,
      },
    }).from(fees)
      .leftJoin(branches, eq(fees.branchId, branches.id))
      .where(eq(fees.id, parseInt(id as string)))
      .limit(1);

    if (feeData.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }

    res.json({ message: 'Fee retrieved successfully', fee: feeData[0] });
  } catch (error: any) {
    res.status(400).json({ message: 'Error retrieving fee', error: error.message });
  }
};

// View Fees for a Class (All roles)
export const viewFeesByClass = async (req: AuthRequest, res: Response) => {
  try {
    const branchId = String(req.params.branchId);
    const className = String(req.params.className);

    const feesData = await db.select({
      id: fees.id,
      branchId: fees.branchId,
      class: fees.class,
      amount: fees.amount,
      dueDate: fees.dueDate,
      createdAt: fees.createdAt,
      updatedAt: fees.updatedAt,
      branch: {
        name: branches.name,
      },
    }).from(fees)
      .leftJoin(branches, eq(fees.branchId, branches.id))
      .where(and(eq(fees.branchId, parseInt(branchId as string)), eq(fees.class, className)));

    res.json({
      message: 'Class fees retrieved successfully',
      count: feesData.length,
      fees: feesData,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error retrieving class fees', error: error.message });
  }
};

// View Fees for a Branch (All roles)
export const viewFeesByBranch = async (req: AuthRequest, res: Response) => {
  try {
    const branchId = String(req.params.branchId);

    const feesData = await db.select({
      id: fees.id,
      branchId: fees.branchId,
      class: fees.class,
      amount: fees.amount,
      dueDate: fees.dueDate,
      createdAt: fees.createdAt,
      updatedAt: fees.updatedAt,
      branch: {
        name: branches.name,
      },
    }).from(fees)
      .leftJoin(branches, eq(fees.branchId, branches.id))
      .where(eq(fees.branchId, parseInt(branchId as string)));

    res.json({
      message: 'Branch fees retrieved successfully',
      count: feesData.length,
      fees: feesData,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error retrieving branch fees', error: error.message });
  }
};

// Mark Student Fee as Paid (Superadmin, Admin, Teacher only)
export const markFeeAsPaid = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = markFeePaymentSchema.parse(req.body);

    const feePaymentResult = await db.select().from(studentFeePayments).where(and(eq(studentFeePayments.studentId, parseInt(validatedData.student)), eq(studentFeePayments.feeId, parseInt(validatedData.fee)))).limit(1);

    if (feePaymentResult.length === 0) {
      return res.status(404).json({ message: 'Fee payment record not found for this student' });
    }

    const updates: any = {
      status: validatedData.status || 'paid',
    };
    if (validatedData.paidDate) {
      updates.paidDate = new Date(validatedData.paidDate);
    } else if (updates.status === 'paid') {
      updates.paidDate = new Date();
    }

    const updatedPayment = await db.update(studentFeePayments).set(updates).where(and(eq(studentFeePayments.studentId, parseInt(validatedData.student)), eq(studentFeePayments.feeId, parseInt(validatedData.fee)))).returning();

    res.json({ message: 'Fee marked as paid successfully', feePayment: updatedPayment[0] });
  } catch (error: any) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// View Student Fee Payments (All roles)
export const viewStudentFeePayments = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = String(req.params.studentId);

    const feePayments = await db.select({
      id: studentFeePayments.id,
      status: studentFeePayments.status,
      paidDate: studentFeePayments.paidDate,
      createdAt: studentFeePayments.createdAt,
      updatedAt: studentFeePayments.updatedAt,
      fee: {
        id: fees.id,
        class: fees.class,
        amount: fees.amount,
        dueDate: fees.dueDate,
      },
      student: {
        name: students.name,
        email: students.email,
      },
    }).from(studentFeePayments)
      .leftJoin(fees, eq(studentFeePayments.feeId, fees.id))
      .leftJoin(students, eq(studentFeePayments.studentId, students.id))
      .where(eq(studentFeePayments.studentId, parseInt(studentId)));

    res.json({
      message: 'Student fee payments retrieved successfully',
      count: feePayments.length,
      feePayments,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error retrieving student fee payments', error: error.message });
  }
};

// View All Fee Payments for a Fee (All roles)
export const viewFeePayments = async (req: AuthRequest, res: Response) => {
  try {
    const { feeId } = req.params;

    const feeResult = await db.select().from(fees).where(eq(fees.id, parseInt(feeId as string))).limit(1);
    if (feeResult.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    const fee = feeResult[0];

    const feePayments = await db.select({
      id: studentFeePayments.id,
      status: studentFeePayments.status,
      paidDate: studentFeePayments.paidDate,
      createdAt: studentFeePayments.createdAt,
      updatedAt: studentFeePayments.updatedAt,
      student: {
        name: students.name,
        email: students.email,
        class: students.class,
      },
    }).from(studentFeePayments)
      .leftJoin(students, eq(studentFeePayments.studentId, students.id))
      .where(eq(studentFeePayments.feeId, parseInt(feeId as string)))
      .orderBy(desc(studentFeePayments.createdAt));

    const paidCount = feePayments.filter(fp => fp.status === 'paid').length;
    const pendingCount = feePayments.filter(fp => fp.status === 'pending').length;

    res.json({
      message: 'Fee payments retrieved successfully',
      fee,
      totalStudents: feePayments.length,
      paidCount,
      pendingCount,
      feePayments,
    });
  } catch (error: any) {
    res.status(400).json({ message: 'Error retrieving fee payments', error: error.message });
  }
};

// Update Student Fee Payment Status (Superadmin, Admin, Teacher only)
export const updateStudentFeePayment = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = String(req.params.studentId);
    const feeId = String(req.params.feeId);
    const { status, paidDate } = req.body;

    if (!['paid', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "paid" or "pending"' });
    }

    const feePaymentResult = await db.select().from(studentFeePayments).where(and(eq(studentFeePayments.studentId, parseInt(studentId)), eq(studentFeePayments.feeId, parseInt(feeId)))).limit(1);
    if (feePaymentResult.length === 0) {
      return res.status(404).json({ message: 'Fee payment record not found' });
    }

    const updates: any = {
      status,
    };
    updates.paidDate = status === 'paid' ? (paidDate ? new Date(paidDate) : new Date()) : null;

    const updated = await db.update(studentFeePayments).set(updates).where(and(eq(studentFeePayments.studentId, parseInt(studentId)), eq(studentFeePayments.feeId, parseInt(feeId)))).returning();
    res.json({ message: 'Fee payment status updated successfully', feePayment: updated[0] });
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating fee payment', error: error.message });
  }
};

// Payment Webhook Handler (Called by Razorpay or payment gateway)
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.body.studentId);
    const feeId = String(req.body.feeId);
    const paymentId = String(req.body.paymentId);
    const paymentStatus = String(req.body.paymentStatus);
    const amount = req.body.amount;

    if (!studentId || !feeId || !paymentId) {
      return res.status(400).json({
        message: 'Missing required fields: studentId, feeId, paymentId',
      });
    }

    const feePaymentResult = await db.select().from(studentFeePayments).where(and(eq(studentFeePayments.studentId, parseInt(studentId)), eq(studentFeePayments.feeId, parseInt(feeId)))).limit(1);
    if (feePaymentResult.length === 0) {
      return res.status(404).json({ message: 'Fee payment record not found' });
    }

    const feeResult = await db.select().from(fees).where(eq(fees.id, parseInt(feeId))).limit(1);
    if (feeResult.length === 0) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    const fee = feeResult[0];

    if (amount && amount !== fee.amount) {
      return res.status(400).json({
        message: 'Payment amount does not match fee amount',
        expectedAmount: fee.amount,
        receivedAmount: amount,
      });
    }

    const updates: any = {};
    if (paymentStatus === 'success' || paymentStatus === 'completed') {
      updates.status = 'paid';
      updates.paidDate = new Date();
    } else if (paymentStatus === 'pending') {
      updates.status = 'pending';
      updates.paidDate = null;
    } else if (paymentStatus === 'failed') {
      return res.status(400).json({
        message: 'Payment failed. Fee payment status not updated.',
      });
    }

    const updated = await db.update(studentFeePayments).set(updates).where(and(eq(studentFeePayments.studentId, parseInt(studentId)), eq(studentFeePayments.feeId, parseInt(feeId)))).returning();
    const feePayment = updated[0];

    res.json({
      message: 'Payment processed successfully',
      paymentId,
      feePayment,
      status: 'success',
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error processing payment webhook',
      error: error.message,
      status: 'error',
    });
  }
};


