"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "School Management API",
            version: "1.0.0",
            description: "API for the School Management System",
        },
        servers: [
            {
                url: "http://localhost:8080",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        username: { type: "string" },
                        role: { type: "string", enum: ["superadmin", "admin", "teacher", "student"] },
                        branch: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Attendance: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        user: { type: "string" },
                        date: { type: "string", format: "date" },
                        status: { type: "string", enum: ["present", "absent"] },
                        markedBy: { type: "string" },
                        type: { type: "string", enum: ["student", "teacher", "admin"] },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Permission: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Fee: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        branch: { type: "string" },
                        class: { type: "string" },
                        amount: { type: "number" },
                        dueDate: { type: "string", format: "date-time" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                StudentFeePayment: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        student: { type: "string" },
                        fee: { type: "string" },
                        status: { type: "string", enum: ["paid", "pending"] },
                        paidDate: { type: "string", format: "date-time", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
            },
        },
    },
    apis: [
        path_1.default.join(__dirname, "../routes/*.ts"),
        path_1.default.join(__dirname, "../routes/**/*.ts"),
    ],
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
