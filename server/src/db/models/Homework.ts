import { pgTable, varchar, timestamp, integer, date, text,  } from 'drizzle-orm/pg-core';
import { teachers } from './Teacher';
import { branches } from './Branch';

export const homeworks = pgTable('homeworks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  teacherId: integer('teacher_id').notNull().references(() => teachers.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  class: varchar('class', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});