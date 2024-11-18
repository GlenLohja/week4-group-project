// db.ts
import { Pool } from 'pg';
import 'dotenv/config';

// Configure the PostgreSQL connection pool
export const pool = new Pool({
    host: process.env.DB_HOST_SUPERBASE,
    user: process.env.DB_USER_SUPERBASE,
    password: process.env.DB_PASSWORD_SUPERBASE,
    database: process.env.DB_DATABASE_SUPERBASE,
    port: Number(process.env.DB_PORT_SUPERBASE),
    
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




















