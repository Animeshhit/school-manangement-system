"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.students = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const User_1 = require("./User");
const Branch_1 = require("./Branch");
exports.students = (0, pg_core_1.pgTable)('students', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => User_1.users.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    class: (0, pg_core_1.varchar)('class', { length: 255 }).notNull(),
    branchId: (0, pg_core_1.integer)('branch_id').notNull().references(() => Branch_1.branches.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
