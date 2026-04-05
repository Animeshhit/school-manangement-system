import { pgTable, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { students } from './Student';
import { fees } from './Fee';

export const studentFeePayments = pgTable('student_fee_payments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer('student_id').notNull().references(() => students.id),
  feeId: integer('fee_id').notNull().references(() => fees.id),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  paidDate: timestamp('paid_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
