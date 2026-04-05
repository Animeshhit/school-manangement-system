"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fees = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const Branch_1 = require("./Branch");
exports.fees = (0, pg_core_1.pgTable)('fees', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    branchId: (0, pg_core_1.integer)('branch_id').notNull().references(() => Branch_1.branches.id),
    class: (0, pg_core_1.varchar)('class', { length: 255 }).notNull(),
    amount: (0, pg_core_1.numeric)('amount').notNull(),
    dueDate: (0, pg_core_1.timestamp)('due_date').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
