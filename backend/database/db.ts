// db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Configure the PostgreSQL connection pool
export const pool = new Pool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
});

// Generic query function to interact with PostgreSQL
export const query = async (text: string, params?: any[]) => {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    } finally {
        client.release();
    }
};



















