// src/app/api/plans/route.ts - (فقط تابع POST اصلاح شد)

import { NextRequest, NextResponse } from 'next/server';
import { query, dbPool, QueryResult } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { PoolConnection } from 'mysql2/promise';

/**
 * @method POST
 * ثبت پلن/خرید پیامک برای کاربر
 */
const purchasePlan = withAuth(async (req: NextRequest, context) => {
    const { userId } = context; // userId از withAuth تزریق شده

    let connection: PoolConnection | null = null;
    try {
        const { plan_id, purchase_type, amount_paid, sms_amount, valid_from, valid_until } = await req.json();

        if (!purchase_type || amount_paid === undefined) {
            return NextResponse.json({ message: 'Required fields missing: purchase_type, amount_paid' }, { status: 400 });
        }
        
        const today = new Date().toISOString().split('T')[0];
        // انقضا پیش‌فرض برای پیامک‌های اعتباری (۱ ماه)
        const defaultExpiration = new Date();
        defaultExpiration.setMonth(defaultExpiration.getMonth() + 1);
        const defaultValidUntil = defaultExpiration.toISOString().split('T')[0];

        // 1. شروع تراکنش
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        let totalSmsToAdd = sms_amount || 0;
        let planKey = null;
        let isPlanPurchase = purchase_type === 'monthly_subscription' && plan_id;

        if (isPlanPurchase) {
            // دریافت اطلاعات پلن
            const [plans]: any = await connection.execute('SELECT free_sms_month, plan_key FROM plans WHERE id = ?', [plan_id]);
            const plan = plans[0];
            
            if (!plan) {
                await connection.rollback();
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }
            
            // برای خرید پلن، sms_amount موجودی پلن را شامل می‌شود.
            totalSmsToAdd = plan.free_sms_month; 
            planKey = plan.plan_key;
        }

        // 2. ثبت خرید در جدول smspurchase (برای هر دو نوع خرید)
        const purchaseSql = `
            INSERT INTO smspurchase 
            (user_id, type, amount_paid, sms_amount, valid_from, valid_until) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const finalValidUntil = isPlanPurchase ? valid_until || defaultValidUntil : defaultValidUntil;

        await connection.execute(purchaseSql, [
            userId, 
            purchase_type, 
            amount_paid, 
            totalSmsToAdd, 
            valid_from || today, 
            finalValidUntil
        ]);

        // 3. به‌روزرسانی موجودی پیامک کاربر (و به‌روزرسانی پلن در صورت لزوم)
        let updateSql = 'UPDATE users SET';
        const updateParams: (string | number | null)[] = [];
        let updateFields: string[] = [];
        
        // ⭐️⭐️ منطق تفکیک موجودی پلن و پیامک خریداری شده ⭐️⭐️
        
        if (isPlanPurchase) {
            // خرید پلن اشتراکی: جایگزینی موجودی پلن
            updateFields.push('sms_balance = ?'); // 👈 جایگزین موجودی پلن می‌شود (ریست ماهانه)
            updateParams.push(totalSmsToAdd);

            updateFields.push('sms_monthly_quota = ?'); // سهمیه ماهانه جدید
            updateParams.push(totalSmsToAdd);

            updateFields.push('plan_key = ?');
            updateParams.push(planKey);
            
            // به‌روزرسانی تاریخ شروع/انقضای سهمیه ماهانه بر اساس خرید جدید
            updateFields.push('quota_starts_at = ?');
            updateParams.push(valid_from || today);
            
            updateFields.push('quota_ends_at = ?');
            updateParams.push(finalValidUntil);

            // صفر کردن وضعیت تریال در صورت انتقال به پلن پولی
            if (planKey && planKey !== 'free_trial') {
                updateFields.push('trial_starts_at = NULL, trial_ends_at = NULL');
            }

        } else if (purchase_type === 'one_time_sms') {
            // خرید یک‌بار مصرف: اضافه کردن به purchased_sms_credit
            updateFields.push('purchased_sms_credit = purchased_sms_credit + ?'); // 👈 اضافه کردن به موجودی خریداری شده
            updateParams.push(totalSmsToAdd);
        } else {
            // اگر نوع خرید نامشخص یا 'trial_quota' است، آن را به موجودی پلن اضافه کن (رفتار پیش‌فرض)
            updateFields.push('sms_balance = sms_balance + ?'); 
            updateParams.push(totalSmsToAdd);
        }

        updateSql += ' ' + updateFields.join(', ');
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