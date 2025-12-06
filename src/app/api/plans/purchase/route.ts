// src/app/api/plans/purchase/route.ts
import { NextResponse } from 'next/server';
import { query, dbPool, QueryResult } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { PoolConnection } from 'mysql2/promise';

/**
 * @method POST
 * ثبت پلن/خرید پیامک برای کاربر
 */
const purchasePlan = withAuth(async (req: Request, userId: number) => {
    let connection: PoolConnection | null = null;
    try {
        const { plan_id, purchase_type, amount_paid, sms_amount, valid_from, valid_until } = await req.json();

        if (!purchase_type || amount_paid === undefined) {
            return NextResponse.json({ message: 'Required fields missing: purchase_type, amount_paid' }, { status: 400 });
        }

        // 1. شروع تراکنش برای اطمینان از صحت عملیات‌های دیتابیس
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        let totalSmsToAdd = sms_amount || 0;
        let planKey = null;

        if (plan_id) {
            // دریافت اطلاعات پلن
            const [plans]: any = await connection.execute('SELECT free_sms_month, plan_key FROM plans WHERE id = ?', [plan_id]);
            const plan = plans[0];
            
            if (!plan) {
                await connection.rollback();
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }
            
            totalSmsToAdd += plan.free_sms_month;
            planKey = plan.plan_key;
        }

        // 2. ثبت خرید در جدول smspurchase
        const purchaseSql = `
            INSERT INTO smspurchase 
            (user_id, type, amount_paid, sms_amount, valid_from, valid_until) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(purchaseSql, [
            userId, 
            purchase_type, 
            amount_paid, 
            totalSmsToAdd, 
            valid_from, 
            valid_until
        ]);

        // 3. افزایش موجودی پیامک کاربر (و به‌روزرسانی پلن در صورت لزوم)
        let updateSql = 'UPDATE users SET sms_balance = sms_balance + ?';
        const updateParams: (string | number)[] = [totalSmsToAdd];

        if (planKey) {
            updateSql += ', plan_key = ?';
            updateParams.push(planKey);
        }
        
        updateSql += ' WHERE id = ?';
        updateParams.push(userId);

        await connection.execute(updateSql, updateParams);

        // 4. اتمام تراکنش
        await connection.commit();
        
        return NextResponse.json({ 
            message: 'Purchase completed successfully. SMS balance updated.', 
            sms_added: totalSmsToAdd 
        }, { status: 201 });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        return NextResponse.json({ message: 'Failed to process purchase (Transaction rolled back)' }, { status: 500 });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

export { purchasePlan as POST };