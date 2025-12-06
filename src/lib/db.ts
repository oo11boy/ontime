// src/lib/db.ts
import mysql from 'mysql2/promise';

// تعریف یک اینترفیس کلی برای نتایج دیتابیس
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

// تنظیمات دیتابیس (استفاده از متغیرهای محیطی)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ontime', // نام دیتابیس شما
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * اجرای یک کوئری SQL
 * @param sql کوئری SQL
 * @param values آرایه‌ای از مقادیر برای جایگذاری
 * @returns نتیجه کوئری (ردیف‌ها یا اطلاعات تغییر)
 */
export async function query<T>(sql: string, values?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, values);
    // اگر کوئری INSERT/UPDATE/DELETE بود، نتیجه را به عنوان یک آرایه با یک عنصر QueryResult برمی‌گرداند.
    if (Array.isArray(rows)) {
        return rows as T[];
    }
    return [{...rows}] as T[]; // برای سازگاری با QueryResult
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error('Internal Server Error (Database)');
  }
}

// Pool برای استفاده در تراکنش‌ها
export const dbPool = pool;