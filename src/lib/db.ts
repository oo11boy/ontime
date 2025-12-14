// src/lib/db.ts
import mysql from 'mysql2/promise';

// تعریف یک اینترفیس کلی برای نتایج دیتابیس (همانند قبل)
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

// 🛑 نکته مهم: در اینجا ما متغیرهای محیطی را بدون Fallback به 'root' تنظیم می‌کنیم.
// این کار برنامه را مجبور می‌کند تا از مقادیر تعریف شده در .env (مانند MYSQL_USER=ontime) استفاده کند.
// نام متغیرها از DB_ به MYSQL_ تغییر داده شد تا با فایل .env شما هماهنگ باشد.

const pool = mysql.createPool({
    // اگر متغیر محیطی ست نشده باشد، Node.js مقدار undefined را استفاده می‌کند و Pool با خطا مواجه می‌شود
    // که بهتر از تلاش برای اتصال با root و رمز خالی است.
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
 * @param sql  
 * @param values
 * @returns
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
        // خطای دیتابیس را به یک خطای عمومی تبدیل می‌کنیم تا جزئیات دیتابیس لو نرود
        throw new Error('Internal Server Error (Database)');
    }
}

// Pool برای استفاده در تراکنش‌ها
export const dbPool = pool;