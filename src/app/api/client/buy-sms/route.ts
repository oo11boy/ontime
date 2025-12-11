// src/app/api/buy-sms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query, dbPool } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { PoolConnection, ResultSetHeader } from 'mysql2/promise';

/**
 * @method POST
 * خرید بسته پیامکی یک‌بارمصرف (one_time_sms)
 * 
 * درخواست نمونه:
 * { 
 *   "sms_count": 300          // فقط تعداد پیامک لازم است
 * }
 * 
 * قیمت هر ۱۰۰ پیامک از روی پلن فعلی کاربر خوانده می‌شود
 */

const purchaseOneTimeSMS = withAuth(async (req: NextRequest, context) => {
    const { userId } = context;
    let connection: PoolConnection | null = null;

    try {
        const body = await req.json();
        const { sms_count } = body;

        // اعتبارسنجی تعداد پیامک
        const validCounts = [100, 200, 300, 500, 1000, 2000];
        if (!sms_count || !validCounts.includes(sms_count)) {
            return NextResponse.json(
                { message: `تعداد پیامک معتبر نیست. گزینه‌های مجاز: ${validCounts.join(', ')}` },
                { status: 400 }
            );
        }

        // شروع تراکنش
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // دریافت قیمت هر ۱۰۰ پیامک از پلن فعلی کاربر
        const userPlanSql = `
            SELECT p.price_per_100_sms
            FROM users u
            LEFT JOIN plans p ON u.plan_key = p.plan_key
            WHERE u.id = ?
            LIMIT 1
        `;

        const [userResult] = await connection.query<any[]>(userPlanSql, [userId]);

        if (!userResult || userResult.length === 0 || userResult[0].price_per_100_sms === null) {
            await connection.rollback();
            return NextResponse.json(
                { message: 'پلن کاربر یافت نشد یا قیمت پیامک مشخص نشده است.' },
                { status: 400 }
            );
        }

        const price_per_100 = Number(userResult[0].price_per_100_sms);

        if (price_per_100 <= 0) {
            await connection.rollback();
            return NextResponse.json(
                { message: 'قیمت پیامک در پلن شما معتبر نیست.' },
                { status: 400 }
            );
        }

        // محاسبه مبلغ کل
        const total_amount = Math.round((sms_count / 100) * price_per_100);

        // تاریخ امروز و انقضا (۳۰ روز آینده)
        const today = new Date();
        const expiresDate = new Date();
        expiresDate.setDate(today.getDate() + 30);

        const todayStr = today.toISOString().split('T')[0];
        const expiresStr = expiresDate.toISOString().split('T')[0];

        // ثبت خرید در جدول smspurchase
        const insertSql = `
            INSERT INTO smspurchase 
            (user_id, type, amount_paid, sms_amount, remaining_sms, valid_from, expires_at, status)
            VALUES (?, 'one_time_sms', ?, ?, ?, ?, ?, 'active')
        `;

        const [insertResult] = await connection.execute<ResultSetHeader>(insertSql, [
            userId,
            total_amount,      // amount_paid
            sms_count,         // sms_amount
            sms_count,         // remaining_sms
            todayStr,          // valid_from
            expiresStr         // expires_at
        ]);

        // دریافت آیدی خرید
        const purchaseId = insertResult.insertId;

        // کامیت تراکنش
        await connection.commit();

        return NextResponse.json({
            message: 'بسته پیامکی با موفقیت خریداری شد.',
            details: {
                sms_count,
                price_per_100,
                total_price: total_amount,
                expires_at: expiresStr,
                remaining_sms: sms_count,
                purchase_id: purchaseId
            }
        }, { status: 201 });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('Buy SMS error:', error);

        return NextResponse.json(
            { message: 'خطا در پردازش خرید پیامک.', error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
});

export { purchaseOneTimeSMS as POST };