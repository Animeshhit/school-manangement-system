"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branches = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.branches = (0, pg_core_1.pgTable)('branches', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    location: (0, pg_core_1.varchar)('location', { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
