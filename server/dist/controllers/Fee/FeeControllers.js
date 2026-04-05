"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentWebhook = exports.updateStudentFeePayment = exports.viewFeePayments = exports.viewStudentFeePayments = exports.markFeeAsPaid = exports.viewFeesByBranch = exports.viewFeesByClass = exports.viewFeeById = exports.viewAllFees = exports.deleteFee = exports.updateFee = exports.createFee = void 0;
const db_1 = require("../../db/db");
const models_1 = require("../../db/models");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
// Zod schemas
const createFeeSchema = zod_1.z.object({
    branch: zod_1.z.string().min(1, 'Branch ID is required'),
    class: zod_1.z.string().min(1, 'Class is required'),
    amount: zod_1.z.number().positive('Amount must be positive'),
    dueDate: zod_1.z.string().datetime('Invalid date format'),
});
const updateFeeSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Amount must be positive').optional(),
    dueDate: zod_1.z.string().datetime('Invalid date format').optional(),
});
const markFeePaymentSchema = zod_1.z.object({
    student: zod_1.z.string().min(1, 'Student ID is required'),
    fee: zod_1.z.string().min(1, 'Fee ID is required'),
    status: zod_1.z.enum(['paid', 'pending']).optional(),
    paidDate: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
});
// Create Fee for Class (Superadmin, Admin, Teacher only)
const createFee = async (req, res) => {
    try {
        const validatedData = createFeeSchema.parse(req.body);
        const branchResult = await db_1.db.select().from(models_1.branches).where((0, drizzle_orm_1.eq)(models_1.branches.id, parseInt(validatedData.branch))).limit(1);
        if (branchResult.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }
        // Check if fee already exists for this class in this branch
        const existingFee = await db_1.db.select().from(models_1.fees).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.fees.branchId, parseInt(validatedData.branch)), (0, drizzle_orm_1.eq)(models_1.fees.class, validatedData.class))).limit(1);
        if (existingFee.length > 0) {
            return res.status(400).json({ message: 'Fee already exists for this class in this branch' });
        }
        const feeResult = await db_1.db.insert(models_1.fees).values({
            branchId: parseInt(validatedData.branch),
            class: validatedData.class,
            amount: validatedData.amount.toString(), // numeric is string
            dueDate: new Date(validatedData.dueDate),
        }).returning();
        const fee = feeResult[0];
        // Get all students in this class and branch
        const studentsInClass = await db_1.db.select().from(models_1.students).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.students.class, validatedData.class), (0, drizzle_orm_1.eq)(models_1.students.branchId, parseInt(validatedData.branch))));
        // Create StudentFeePayment records for all students in the class
        if (studentsInClass.length > 0) {
            const feePayments = studentsInClass.map(student => ({
                studentId: student.id,
                feeId: fee.id,
                status: 'pending',
            }));
            await db_1.db.insert(models_1.studentFeePayments).values(feePayments);
        }
        res.status(201).json({
            message: 'Fee created successfully and assigned to all students in this class',
            fee,
            studentsAssigned: studentsInClass.length,
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error: error.message });
    }
};
exports.createFee = createFee;
// Update Fee (Superadmin, Admin, Teacher only)
const updateFee = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateFeeSchema.parse(req.body);
        const updates = {};
        if (validatedData.amount)
            updates.amount = validatedData.amount.toString();
        if (validatedData.dueDate)
            updates.dueDate = new Date(validatedData.dueDate);
        const feeResult = await db_1.db.update(models_1.fees).set(updates).where((0, drizzle_orm_1.eq)(models_1.fees.id, parseInt(id))).returning();
        if (feeResult.length === 0) {
            return res.status(404).json({ message: 'Fee not found' });
        }
        res.json({ message: 'Fee updated successfully', fee: feeResult[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error: error.message });
    }
};
exports.updateFee = updateFee;
// Delete Fee (Superadmin, Admin, Teacher only)
const deleteFee = async (req, res) => {
    try {
        const { id } = req.params;
        const feeResult = await db_1.db.delete(models_1.fees).where((0, drizzle_orm_1.eq)(models_1.fees.id, parseInt(id))).returning();
        if (feeResult.length === 0) {
            return res.status(404).json({ message: 'Fee not found' });
        }
        // Delete all student fee payments for this fee
        await db_1.db.delete(models_1.studentFeePayments).where((0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(id)));
        res.json({ message: 'Fee deleted successfully and removed from all students' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting fee', error: error.message });
    }
};
exports.deleteFee = deleteFee;
// View All Fees (All roles)
const viewAllFees = async (req, res) => {
    try {
        const feesData = await db_1.db.select({
            id: models_1.fees.id,
            branchId: models_1.fees.branchId,
            class: models_1.fees.class,
            amount: models_1.fees.amount,
            dueDate: models_1.fees.dueDate,
            createdAt: models_1.fees.createdAt,
            updatedAt: models_1.fees.updatedAt,
            branch: {
                name: models_1.branches.name,
            },
        }).from(models_1.fees)
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.fees.branchId, models_1.branches.id))
            .orderBy((0, drizzle_orm_1.desc)(models_1.fees.createdAt));
        res.json({ message: 'Fees retrieved successfully', count: feesData.length, fees: feesData });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving fees', error: error.message });
    }
};
exports.viewAllFees = viewAllFees;
// View Fee by ID (All roles)
const viewFeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const feeData = await db_1.db.select({
            id: models_1.fees.id,
            branchId: models_1.fees.branchId,
            class: models_1.fees.class,
            amount: models_1.fees.amount,
            dueDate: models_1.fees.dueDate,
            createdAt: models_1.fees.createdAt,
            updatedAt: models_1.fees.updatedAt,
            branch: {
                name: models_1.branches.name,
            },
        }).from(models_1.fees)
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.fees.branchId, models_1.branches.id))
            .where((0, drizzle_orm_1.eq)(models_1.fees.id, parseInt(id)))
            .limit(1);
        if (feeData.length === 0) {
            return res.status(404).json({ message: 'Fee not found' });
        }
        res.json({ message: 'Fee retrieved successfully', fee: feeData[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Error retrieving fee', error: error.message });
    }
};
exports.viewFeeById = viewFeeById;
// View Fees for a Class (All roles)
const viewFeesByClass = async (req, res) => {
    try {
        const branchId = String(req.params.branchId);
        const className = String(req.params.className);
        const feesData = await db_1.db.select({
            id: models_1.fees.id,
            branchId: models_1.fees.branchId,
            class: models_1.fees.class,
            amount: models_1.fees.amount,
            dueDate: models_1.fees.dueDate,
            createdAt: models_1.fees.createdAt,
            updatedAt: models_1.fees.updatedAt,
            branch: {
                name: models_1.branches.name,
            },
        }).from(models_1.fees)
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.fees.branchId, models_1.branches.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.fees.branchId, parseInt(branchId)), (0, drizzle_orm_1.eq)(models_1.fees.class, className)));
        res.json({
            message: 'Class fees retrieved successfully',
            count: feesData.length,
            fees: feesData,
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Error retrieving class fees', error: error.message });
    }
};
exports.viewFeesByClass = viewFeesByClass;
// View Fees for a Branch (All roles)
const viewFeesByBranch = async (req, res) => {
    try {
        const branchId = String(req.params.branchId);
        const feesData = await db_1.db.select({
            id: models_1.fees.id,
            branchId: models_1.fees.branchId,
            class: models_1.fees.class,
            amount: models_1.fees.amount,
            dueDate: models_1.fees.dueDate,
            createdAt: models_1.fees.createdAt,
            updatedAt: models_1.fees.updatedAt,
            branch: {
                name: models_1.branches.name,
            },
        }).from(models_1.fees)
            .leftJoin(models_1.branches, (0, drizzle_orm_1.eq)(models_1.fees.branchId, models_1.branches.id))
            .where((0, drizzle_orm_1.eq)(models_1.fees.branchId, parseInt(branchId)));
        res.json({
            message: 'Branch fees retrieved successfully',
            count: feesData.length,
            fees: feesData,
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Error retrieving branch fees', error: error.message });
    }
};
exports.viewFeesByBranch = viewFeesByBranch;
// Mark Student Fee as Paid (Superadmin, Admin, Teacher only)
const markFeeAsPaid = async (req, res) => {
    try {
        const validatedData = markFeePaymentSchema.parse(req.body);
        const feePaymentResult = await db_1.db.select().from(models_1.studentFeePayments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(validatedData.student)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(validatedData.fee)))).limit(1);
        if (feePaymentResult.length === 0) {
            return res.status(404).json({ message: 'Fee payment record not found for this student' });
        }
        const updates = {
            status: validatedData.status || 'paid',
        };
        if (validatedData.paidDate) {
            updates.paidDate = new Date(validatedData.paidDate);
        }
        else if (updates.status === 'paid') {
            updates.paidDate = new Date();
        }
        const updatedPayment = await db_1.db.update(models_1.studentFeePayments).set(updates).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(validatedData.student)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(validatedData.fee)))).returning();
        res.json({ message: 'Fee marked as paid successfully', feePayment: updatedPayment[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Validation error', error: error.message });
    }
};
exports.markFeeAsPaid = markFeeAsPaid;
// View Student Fee Payments (All roles)
const viewStudentFeePayments = async (req, res) => {
    try {
        const studentId = String(req.params.studentId);
        const feePayments = await db_1.db.select({
            id: models_1.studentFeePayments.id,
            status: models_1.studentFeePayments.status,
            paidDate: models_1.studentFeePayments.paidDate,
            createdAt: models_1.studentFeePayments.createdAt,
            updatedAt: models_1.studentFeePayments.updatedAt,
            fee: {
                id: models_1.fees.id,
                class: models_1.fees.class,
                amount: models_1.fees.amount,
                dueDate: models_1.fees.dueDate,
            },
            student: {
                name: models_1.students.name,
                email: models_1.students.email,
            },
        }).from(models_1.studentFeePayments)
            .leftJoin(models_1.fees, (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, models_1.fees.id))
            .leftJoin(models_1.students, (0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, models_1.students.id))
            .where((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(studentId)));
        res.json({
            message: 'Student fee payments retrieved successfully',
            count: feePayments.length,
            feePayments,
        });
    }
    catch (error) {
        res.status(400).json({ message: 'Error retrieving student fee payments', error: error.message });
    }
};
exports.viewStudentFeePayments = viewStudentFeePayments;
// View All Fee Payments for a Fee (All roles)
const viewFeePayments = async (req, res) => {
    try {
        const { feeId } = req.params;
        const feeResult = await db_1.db.select().from(models_1.fees).where((0, drizzle_orm_1.eq)(models_1.fees.id, parseInt(feeId))).limit(1);
        if (feeResult.length === 0) {
            return res.status(404).json({ message: 'Fee not found' });
        }
        const fee = feeResult[0];
        const feePayments = await db_1.db.select({
            id: models_1.studentFeePayments.id,
            status: models_1.studentFeePayments.status,
            paidDate: models_1.studentFeePayments.paidDate,
            createdAt: models_1.studentFeePayments.createdAt,
            updatedAt: models_1.studentFeePayments.updatedAt,
            student: {
                name: models_1.students.name,
                email: models_1.students.email,
                class: models_1.students.class,
            },
        }).from(models_1.studentFeePayments)
            .leftJoin(models_1.students, (0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, models_1.students.id))
            .where((0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(feeId)))
            .orderBy((0, drizzle_orm_1.desc)(models_1.studentFeePayments.createdAt));
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
    }
    catch (error) {
        res.status(400).json({ message: 'Error retrieving fee payments', error: error.message });
    }
};
exports.viewFeePayments = viewFeePayments;
// Update Student Fee Payment Status (Superadmin, Admin, Teacher only)
const updateStudentFeePayment = async (req, res) => {
    try {
        const studentId = String(req.params.studentId);
        const feeId = String(req.params.feeId);
        const { status, paidDate } = req.body;
        if (!['paid', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "paid" or "pending"' });
        }
        const feePaymentResult = await db_1.db.select().from(models_1.studentFeePayments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(studentId)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(feeId)))).limit(1);
        if (feePaymentResult.length === 0) {
            return res.status(404).json({ message: 'Fee payment record not found' });
        }
        const updates = {
            status,
        };
        updates.paidDate = status === 'paid' ? (paidDate ? new Date(paidDate) : new Date()) : null;
        const updated = await db_1.db.update(models_1.studentFeePayments).set(updates).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(studentId)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(feeId)))).returning();
        res.json({ message: 'Fee payment status updated successfully', feePayment: updated[0] });
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating fee payment', error: error.message });
    }
};
exports.updateStudentFeePayment = updateStudentFeePayment;
// Payment Webhook Handler (Called by Razorpay or payment gateway)
const handlePaymentWebhook = async (req, res) => {
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
        const feePaymentResult = await db_1.db.select().from(models_1.studentFeePayments).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(studentId)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(feeId)))).limit(1);
        if (feePaymentResult.length === 0) {
            return res.status(404).json({ message: 'Fee payment record not found' });
        }
        const feeResult = await db_1.db.select().from(models_1.fees).where((0, drizzle_orm_1.eq)(models_1.fees.id, parseInt(feeId))).limit(1);
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
        const updates = {};
        if (paymentStatus === 'success' || paymentStatus === 'completed') {
            updates.status = 'paid';
            updates.paidDate = new Date();
        }
        else if (paymentStatus === 'pending') {
            updates.status = 'pending';
            updates.paidDate = null;
        }
        else if (paymentStatus === 'failed') {
            return res.status(400).json({
                message: 'Payment failed. Fee payment status not updated.',
            });
        }
        const updated = await db_1.db.update(models_1.studentFeePayments).set(updates).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.studentFeePayments.studentId, parseInt(studentId)), (0, drizzle_orm_1.eq)(models_1.studentFeePayments.feeId, parseInt(feeId)))).returning();
        const feePayment = updated[0];
        res.json({
            message: 'Payment processed successfully',
            paymentId,
            feePayment,
            status: 'success',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error processing payment webhook',
            error: error.message,
            status: 'error',
        });
    }
};
exports.handlePaymentWebhook = handlePaymentWebhook;
