// src/lib/db.ts
import mysql from 'mysql2/promise';

export interface QueryResult {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
}

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * اجرای یک کوئری SQL
 * تغییر مهم: استفاده از pool.query به جای pool.execute برای سازگاری با MariaDB
 */
export async function query<T>(sql: string, values?: any[]): Promise<T[]> {
    try {
        // استفاده از query به جای execute (سازگارتر با MariaDB)
        const [rows] = await pool.query(sql, values);
        
        if (Array.isArray(rows)) {
            return rows as T[];
        }
        return [{...rows}] as T[];
    } catch (error: any) {
        console.error("Database query error:", error);
        console.error("SQL:", sql);
        console.error("Values:", values);
        throw new Error(`Database error: ${error.message}`);
    }
}

// تابع execute برای عملیات‌هایی که نیاز به prepared statement دارند (اختیاری)
export async function execute<T>(sql: string, values?: any[]): Promise<T[]> {
    try {
        const [rows] = await pool.execute(sql, values);
        if (Array.isArray(rows)) {
            return rows as T[];
        }
        return [{...rows}] as T[];
    } catch (error: any) {
        console.error("Database execute error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export const dbPool = pool;