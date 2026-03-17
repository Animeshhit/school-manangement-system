"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neon_http_1 = require("drizzle-orm/neon-http");
const env_1 = require("../env");
const db = (0, neon_http_1.drizzle)(env_1.DB_URL);
