import { pgTable, varchar, timestamp, integer, date, numeric } from 'drizzle-orm/pg-core';
import { branches } from './Branch';

export const fees = pgTable('fees', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  class: varchar('class', { length: 255 }).notNull(),
  amount: numeric('amount').notNull(),
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});