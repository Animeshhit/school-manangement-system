"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./env");
const superadmin_route_1 = __importDefault(require("./routes/superadmin.route"));
app_1.default.use("/api/superadmin", superadmin_route_1.default);
app_1.default.listen(env_1.PORT, () => {
    console.log(`✨server is running at http://localhost:${env_1.PORT} 🌍`);
});
