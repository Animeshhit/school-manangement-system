"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSchema = void 0;
const zod_1 = require("zod");
exports.setupSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        error: "Email is required"
    })
        .trim()
        .toLowerCase()
        .pipe(zod_1.z.email("Invalid email address")),
    password: zod_1.z
        .string({
        error: "Password is required"
    })
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
});
