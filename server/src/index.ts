import app from "./app";
import { PORT } from "./env";
import SuperAdminRouter from "./routes/superadmin.route";
import AdminRouter from "./routes/admin.route";
import TeacherRouter from "./routes/teachers.route";
import StudentRouter from "./routes/students.route";
import PermissionRouter from "./routes/permissions.route";
import FeeRouter from "./routes/fee.route";
import GenerateRouter from './routes/general.route';
import { seedDefaultPermissions } from "./controllers/SuperAdmin/SuperAdminControllers";

// Seed default permissions on startup
seedDefaultPermissions().catch(console.error);

app.use("/api/superadmin", SuperAdminRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/teacher", TeacherRouter);
app.use("/api/student", StudentRouter);
app.use("/api/permissions", PermissionRouter);
app.use("/api/general", GenerateRouter);
app.use("/api/fee", FeeRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });