"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./env");
const superadmin_route_1 = __importDefault(require("./routes/superadmin.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const teachers_route_1 = __importDefault(require("./routes/teachers.route"));
const students_route_1 = __importDefault(require("./routes/students.route"));
const permissions_route_1 = __importDefault(require("./routes/permissions.route"));
const fee_route_1 = __importDefault(require("./routes/fee.route"));
const SuperAdminControllers_1 = require("./controllers/SuperAdmin/SuperAdminControllers");
// Seed default permissions on startup
(0, SuperAdminControllers_1.seedDefaultPermissions)().catch(console.error);
app_1.default.use("/api/superadmin", superadmin_route_1.default);
app_1.default.use("/api/admin", admin_route_1.default);
app_1.default.use("/api/teacher", teachers_route_1.default);
app_1.default.use("/api/student", students_route_1.default);
app_1.default.use("/api/permissions", permissions_route_1.default);
app_1.default.use("/api/fee", fee_route_1.default);
app_1.default.listen(env_1.PORT, () => {
    console.log(`Server is running on port ${env_1.PORT}`);
});
