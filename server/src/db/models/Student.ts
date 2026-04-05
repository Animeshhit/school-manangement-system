import { pgTable, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './User';
import { branches } from './Branch';

export const students = pgTable('students', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  class: varchar('class', { length: 255 }).notNull(),
  branchId: integer('branch_id').notNull().references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});