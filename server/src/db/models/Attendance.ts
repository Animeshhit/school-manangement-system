import { pgTable, varchar, timestamp, integer, date, } from 'drizzle-orm/pg-core';
import { users } from './User';

export const attendances = pgTable('attendances', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  markedBy: integer('marked_by').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});