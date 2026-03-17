import app from "./app";
import { PORT } from "./env";
import SuperAdminRouter from "./routes/superadmin.route";

app.use("/api/superadmin", SuperAdminRouter);

app.listen(PORT, () => {
  console.log(`✨server is running at http://localhost:${PORT} 🌍`);
});
