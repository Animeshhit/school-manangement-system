import { drizzle } from 'drizzle-orm/neon-http';
import { DB_URL } from '../env';

const db = drizzle(DB_URL);
