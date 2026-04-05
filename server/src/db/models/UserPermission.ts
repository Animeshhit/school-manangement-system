import { pgTable, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { users } from './User';
import { permissions } from './Permission';

export const userPermissions = pgTable('user-permissions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id),
  permissionId: integer('permission_id').notNull().references(() => permissions.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  unique('user_permission_unique').on(table.userId, table.permissionId),
]);