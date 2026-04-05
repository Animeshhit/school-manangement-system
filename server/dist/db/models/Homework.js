"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeworks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const Teacher_1 = require("./Teacher");
const Branch_1 = require("./Branch");
exports.homeworks = (0, pg_core_1.pgTable)('homeworks', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    teacherId: (0, pg_core_1.integer)('teacher_id').notNull().references(() => Teacher_1.teachers.id),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    dueDate: (0, pg_core_1.timestamp)('due_date').notNull(),
    branchId: (0, pg_core_1.integer)('branch_id').notNull().references(() => Branch_1.branches.id),
    class: (0, pg_core_1.varchar)('class', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
