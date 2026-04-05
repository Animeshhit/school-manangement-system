"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentFeePayments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const Student_1 = require("./Student");
const Fee_1 = require("./Fee");
exports.studentFeePayments = (0, pg_core_1.pgTable)('student_fee_payments', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    studentId: (0, pg_core_1.integer)('student_id').notNull().references(() => Student_1.students.id),
    feeId: (0, pg_core_1.integer)('fee_id').notNull().references(() => Fee_1.fees.id),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).default('pending').notNull(),
    paidDate: (0, pg_core_1.timestamp)('paid_date'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
