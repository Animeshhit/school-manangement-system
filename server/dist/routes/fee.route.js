"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FeeControllers_1 = require("../controllers/Fee/FeeControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/fee/create:
 *   post:
 *     summary: Create a new fee structure for a class (Superadmin, Admin, Teacher only)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch
 *               - class
 *               - amount
 *               - dueDate
 *             properties:
 *               branch:
 *                 type: string
 *                 description: Branch ID
 *               class:
 *                 type: string
 *                 description: Class name/level (e.g., Class 6, Class 5)
 *               amount:
 *                 type: number
 *                 description: Fee amount in rupees
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the fee
 *     responses:
 *       201:
 *         description: Fee structure created successfully. All students in this class are automatically assigned this fee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fee:
 *                   $ref: '#/components/schemas/Fee'
 *                 studentsAssigned:
 *                   type: number
 *       400:
 *         description: Validation error or fee already exists for this class
 *       403:
 *         description: Access denied - Students cannot create fees
 *       404:
 *         description: Branch not found
 */
router.post('/create', auth_1.authenticateToken, auth_1.requireNonStudent, FeeControllers_1.createFee);
/**
 * @swagger
 * /api/fee/webhook/payment-callback:
 *   post:
 *     summary: Webhook endpoint for payment gateway (Razorpay, PayPal, etc.) - No authentication required
 *     tags:
 *       - Fee
 *       - Webhook
 *     description: This endpoint is called by payment gateways like Razorpay when a payment is completed. No authentication is required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - feeId
 *               - paymentId
 *               - paymentStatus
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student ID
 *               feeId:
 *                 type: string
 *                 description: Fee ID
 *               paymentId:
 *                 type: string
 *                 description: Payment ID from payment gateway (e.g., Razorpay Order ID)
 *               paymentStatus:
 *                 type: string
 *                 enum: [success, completed, pending, failed]
 *                 description: Payment status from gateway
 *               amount:
 *                 type: number
 *                 description: Amount paid (optional, will be verified against fee amount)
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 paymentId:
 *                   type: string
 *                 feePayment:
 *                   $ref: '#/components/schemas/StudentFeePayment'
 *                 status:
 *                   type: string
 *                   enum: [success, error]
 *       400:
 *         description: Invalid request, missing fields, or payment amount mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [error]
 *       404:
 *         description: Student or Fee payment record not found
 *       500:
 *         description: Server error processing webhook
 */
router.post('/webhook/payment-callback', FeeControllers_1.handlePaymentWebhook);
/**
 * @swagger
 * /api/fee:
 *   get:
 *     summary: View all fees (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All fees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 fees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fee'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth_1.authenticateToken, FeeControllers_1.viewAllFees);
/**
 * @swagger
 * /api/fee/view/{id}:
 *   get:
 *     summary: View a specific fee by ID (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fee:
 *                   $ref: '#/components/schemas/Fee'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Fee not found
 */
router.get('/view/:id', auth_1.authenticateToken, FeeControllers_1.viewFeeById);
/**
 * @swagger
 * /api/fee/branch/{branchId}:
 *   get:
 *     summary: View all fees for a specific branch (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch fees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 fees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fee'
 *       401:
 *         description: Unauthorized
 */
router.get('/branch/:branchId', auth_1.authenticateToken, FeeControllers_1.viewFeesByBranch);
/**
 * @swagger
 * /api/fee/class/{branchId}/{className}:
 *   get:
 *     summary: View fees for a specific class in a branch (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *       - in: path
 *         name: className
 *         required: true
 *         schema:
 *           type: string
 *         description: Class name (e.g., Class 6, Class 5)
 *     responses:
 *       200:
 *         description: Class fees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 fees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fee'
 *       401:
 *         description: Unauthorized
 */
router.get('/class/:branchId/:className', auth_1.authenticateToken, FeeControllers_1.viewFeesByClass);
/**
 * @swagger
 * /api/fee/payments/{feeId}:
 *   get:
 *     summary: View all student fee payments for a specific fee (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fee:
 *                   $ref: '#/components/schemas/Fee'
 *                 totalStudents:
 *                   type: number
 *                 paidCount:
 *                   type: number
 *                 pendingCount:
 *                   type: number
 *                 feePayments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentFeePayment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Fee not found
 */
router.get('/payments/:feeId', auth_1.authenticateToken, FeeControllers_1.viewFeePayments);
/**
 * @swagger
 * /api/fee/student-payments/{studentId}:
 *   get:
 *     summary: View all fee payments for a specific student (All roles)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student fee payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 feePayments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentFeePayment'
 *       401:
 *         description: Unauthorized
 */
router.get('/student-payments/:studentId', auth_1.authenticateToken, FeeControllers_1.viewStudentFeePayments);
/**
 * @swagger
 * /api/fee/{id}:
 *   put:
 *     summary: Update a fee structure (Superadmin, Admin, Teacher only)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Fee amount in rupees
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the fee
 *     responses:
 *       200:
 *         description: Fee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fee:
 *                   $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied - Students cannot update fees
 *       404:
 *         description: Fee not found
 */
router.put('/:id', auth_1.authenticateToken, auth_1.requireNonStudent, FeeControllers_1.updateFee);
/**
 * @swagger
 * /api/fee/mark-paid/{studentId}/{feeId}:
 *   post:
 *     summary: Mark student fee as paid (Superadmin, Admin, Teacher only)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, pending]
 *                 description: Payment status
 *               paidDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when fee was paid (optional, defaults to current date)
 *     responses:
 *       200:
 *         description: Fee marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feePayment:
 *                   $ref: '#/components/schemas/StudentFeePayment'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied - Students cannot mark fees
 *       404:
 *         description: Fee payment record not found
 */
router.post('/mark-paid/:studentId/:feeId', auth_1.authenticateToken, auth_1.requireNonStudent, FeeControllers_1.markFeeAsPaid);
/**
 * @swagger
 * /api/fee/{id}:
 *   delete:
 *     summary: Delete a fee structure (Superadmin, Admin, Teacher only)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     responses:
 *       200:
 *         description: Fee deleted successfully and removed from all students
 *       403:
 *         description: Access denied - Students cannot delete fees
 *       404:
 *         description: Fee not found
 */
router.delete('/:id', auth_1.authenticateToken, auth_1.requireNonStudent, FeeControllers_1.deleteFee);
/**
 * @swagger
 * /api/fee/payment/{studentId}/{feeId}:
 *   put:
 *     summary: Update student fee payment status manually (Superadmin, Admin, Teacher only)
 *     tags:
 *       - Fee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, pending]
 *                 description: Payment status
 *               paidDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when fee was paid (optional, defaults to current date if status is paid)
 *     responses:
 *       200:
 *         description: Fee payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feePayment:
 *                   $ref: '#/components/schemas/StudentFeePayment'
 *       400:
 *         description: Invalid status or validation error
 *       403:
 *         description: Access denied - Students cannot update fees
 *       404:
 *         description: Fee payment record not found
 */
router.put('/payment/:studentId/:feeId', auth_1.authenticateToken, auth_1.requireNonStudent, FeeControllers_1.updateStudentFeePayment);
exports.default = router;
