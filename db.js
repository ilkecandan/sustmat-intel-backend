import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export default client;
