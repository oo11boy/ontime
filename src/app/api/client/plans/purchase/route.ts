import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import { PoolConnection } from 'mysql2/promise';

/**
 * @method POST
 * ثبت خرید پلن (رایگان/پولی) یا اعتبار پیامکی
 */
const purchasePlan = withAuth(async (req: NextRequest, context) => {
    const { userId } = context;

    let connection: PoolConnection | null = null;
    try {
        const { plan_id, purchase_type, amount_paid, sms_amount, valid_from } = await req.json();

        if (!purchase_type || amount_paid === undefined) {
            return NextResponse.json({ message: 'Required fields missing' }, { status: 400 });
        }

        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        let totalSmsToAdd = sms_amount || 0;
        let planKey = null;
        let finalValidUntil: string;

        const isPlanPurchase = purchase_type === 'monthly_subscription' && plan_id;
        const isTrialPurchase = purchase_type === 'free_trial' || purchase_type === 'trial_quota';

        // ۱. منطق تعیین تاریخ انقضا و دریافت اطلاعات پلن
        if (isPlanPurchase || isTrialPurchase) {
            const [plans]: any = await connection.execute(
                'SELECT free_sms_month, plan_key FROM plans WHERE id = ?', 
                [plan_id]
            );
            const plan = plans[0];

            if (!plan) {
                await connection.rollback();
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }

            totalSmsToAdd = plan.free_sms_month;
            planKey = plan.plan_key;

            // محاسبه تاریخ انقضا: اگر رایگان بود ۲ ماه، در غیر این صورت ۱ ماه
            const expirationDate = new Date();
            if (planKey === 'free_trial') {
                expirationDate.setMonth(expirationDate.getMonth() + 2);
            } else {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            }
            finalValidUntil = expirationDate.toISOString().split('T')[0];
        } else {
            // برای خرید پیامک تکی (بدون پلن)
            const defaultExp = new Date();
            defaultExp.setMonth(defaultExp.getMonth() + 1);
            finalValidUntil = defaultExp.toISOString().split('T')[0];
        }

        // ۲. ثبت در جدول smspurchase
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
            valid_from || todayStr, 
            finalValidUntil
        ]);

        // ۳. به‌روزرسانی جدول users
        let updateFields: string[] = [];
        const updateParams: any[] = [];

        if (isPlanPurchase || isTrialPurchase) {
            // تنظیمات پلن و سهمیه ماهانه
            updateFields.push('sms_balance = ?', 'sms_monthly_quota = ?', 'plan_key = ?');
            updateParams.push(totalSmsToAdd, totalSmsToAdd, planKey);

            updateFields.push('quota_starts_at = ?', 'quota_ends_at = ?');
            updateParams.push(valid_from || todayStr, finalValidUntil);

            // اگر پلن جدید خریداری شده و رایگان نیست، اطلاعات تریال قبلی پاک شود
            if (planKey !== 'free_trial') {
                updateFields.push('trial_starts_at = NULL', 'trial_ends_at = NULL');
            } else {
                // اگر پلن رایگان فعال شده
                updateFields.push('trial_starts_at = ?', 'trial_ends_at = ?');
                updateParams.push(valid_from || todayStr, finalValidUntil);
            }
        } else if (purchase_type === 'one_time_sms') {
            // فقط اضافه کردن به اعتبار خریداری شده
            updateFields.push('purchased_sms_credit = purchased_sms_credit + ?');
            updateParams.push(totalSmsToAdd);
        }

        if (updateFields.length > 0) {
            const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            updateParams.push(userId);
            await connection.execute(updateSql, updateParams);
        }

        await connection.commit();
        
        return NextResponse.json({ 
            message: 'Plan activated successfully', 
            expires_at: finalValidUntil,
            sms_added: totalSmsToAdd 
        }, { status: 201 });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('Purchase Error:', error);
        return NextResponse.json({ message: error.message || 'Transaction failed' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
});

export { purchasePlan as POST };