"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPermissions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const User_1 = require("./User");
const Permission_1 = require("./Permission");
exports.userPermissions = (0, pg_core_1.pgTable)('user-permissions', {
    id: (0, pg_core_1.integer)('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => User_1.users.id),
    permissionId: (0, pg_core_1.integer)('permission_id').notNull().references(() => Permission_1.permissions.id),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)('user_permission_unique').on(table.userId, table.permissionId),
]);
