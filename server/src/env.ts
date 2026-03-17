import dotenv from 'dotenv';
dotenv.config();



export const PORT = process.env.PORT || 8080;
export const DB_URL = process.env.DATABASE_URL || "";