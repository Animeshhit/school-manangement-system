import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import {DB_URL} from "./src/env"

export default defineConfig({
  out: './drizzle',
  schema: './src/schema/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});
