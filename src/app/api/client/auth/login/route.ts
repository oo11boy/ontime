// src/app/api/auth/route.ts

import { NextResponse } from 'next/server';
import { query, QueryResult } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const MOCK_OTP = '123456';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, otp, resend } = body;

        if (!phone) {
            return NextResponse.json({ message: 'شماره موبایل الزامی است.' }, { status: 400 });
        }

        // مرحله ارسال OTP (یا ارسال مجدد)
        if (!otp || resend) {
            const users = await query<{ id: number }>('SELECT id FROM users WHERE phone = ?', [phone]);
            const isRegistered = users.length > 0;

            if (!isRegistered) {
                await query<QueryResult>(
                    'INSERT INTO users (phone, plan_key) VALUES (?, ?)',
                    [phone, 'free_trial']
                );
            }

            return NextResponse.json({
                message: 'کد تأیید ارسال شد (تست: 123456)',
                otp: MOCK_OTP
            });
        }

        // مرحله تأیید OTP
        if (otp !== MOCK_OTP) {
            return NextResponse.json({ message: 'کد تأیید اشتباه است.' }, { status: 401 });
        }

        const users = await query<{
            id: number;
            name: string | null;
            job_id: number | null;
        }>('SELECT id, name, job_id FROM users WHERE phone = ?', [phone]);

        if (users.length === 0) {
            return NextResponse.json({ message: 'کاربر یافت نشد.' }, { status: 404 });
        }

        const user = users[0];
        const token = generateToken(user.id);

        // تنظیم کوکی
        (await cookies()).set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
        });

        const signupComplete = !!user.name && !!user.job_id;

        // در این مرحله تریال فعال نمی‌شود و مودال هم نشان داده نمی‌شود
        return NextResponse.json({
            message: 'ورود موفقیت‌آمیز بود.',
            signup_complete: signupComplete,
            // show_welcome_modal ارسال نمی‌شود (همیشه false در نظر گرفته می‌شود)
        });

    } catch (error: any) {
        console.error('خطا در احراز هویت:', error);
        return NextResponse.json({ message: 'خطا در سرور.' }, { status: 500 });
    }
}