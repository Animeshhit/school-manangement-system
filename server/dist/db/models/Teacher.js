"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teachers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const User_1 = require("./User");
const Branch_1 = require("./Branch");
exports.teachers = (0, pg_core_1.pgTable)('teachers', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => User_1.users.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }).notNull(),
    branchId: (0, pg_core_1.integer)('branch_id').references(() => Branch_1.branches.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
