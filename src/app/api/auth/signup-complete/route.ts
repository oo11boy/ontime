// src/app/api/auth/signup-complete/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

const POST = withAuth(async (req: NextRequest, context: { userId: number }) => {
    const { userId } = context;

    try {
        const { name, job_id } = await req.json();

        if (!name || !job_id) {
            return NextResponse.json({ message: 'نام و شاخه کاری الزامی است' }, { status: 400 });
        }

        const jobIdNumber = parseInt(job_id, 10);
        if (isNaN(jobIdNumber)) {
            return NextResponse.json({ message: 'شاخه کاری نامعتبر است' }, { status: 400 });
        }

        // بررسی اینکه آیا قبلاً تریال فعال شده یا نه
        const userResult = await query<{ trial_starts_at: string | null }>(
            'SELECT trial_starts_at FROM users WHERE id = ?',
            [userId]
        );

        const user = userResult[0];
        const isFirstTimeCompletingSignup = !user?.trial_starts_at;

        let showWelcomeModal = false;

        if (isFirstTimeCompletingSignup) {
            // اولین بار که ثبت‌نام کامل می‌شود → فعال‌سازی تریال و تنظیم فلگ مودال
            const today = new Date().toISOString().split('T')[0];
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            const quotaEndsAt = oneMonthLater.toISOString().split('T')[0];
            const threeMonthsLater = new Date();
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
            const trialEndsAt = threeMonthsLater.toISOString().split('T')[0];

            await query(
                `UPDATE users 
                 SET name = ?, 
                     job_id = ?,
                     sms_monthly_quota = 150, 
                     sms_balance = 150, 
                     trial_starts_at = ?, 
                     trial_ends_at = ?, 
                     quota_starts_at = ?, 
                     quota_ends_at = ?
                 WHERE id = ?`,
                [name.trim(), jobIdNumber, today, trialEndsAt, today, quotaEndsAt, userId]
            );

            showWelcomeModal = true;
        } else {
            // اگر قبلاً تکمیل شده بود، فقط نام و شغل را به‌روزرسانی کن
            await query(
                'UPDATE users SET name = ?, job_id = ? WHERE id = ?',
                [name.trim(), jobIdNumber, userId]
            );
        }

        return NextResponse.json({
            message: 'ثبت‌نام با موفقیت تکمیل شد.',
            show_welcome_modal: showWelcomeModal
        });

    } catch (error) {
        console.error('Signup complete error:', error);
        return NextResponse.json({ message: 'خطا در سرور.' }, { status: 500 });
    }
});

export { POST };