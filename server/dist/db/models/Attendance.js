"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendances = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const User_1 = require("./User");
exports.attendances = (0, pg_core_1.pgTable)('attendances', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => User_1.users.id),
    date: (0, pg_core_1.timestamp)('date').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull(),
    markedBy: (0, pg_core_1.integer)('marked_by').notNull().references(() => User_1.users.id),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
