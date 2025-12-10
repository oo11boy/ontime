// src/app/api/auth/route.ts

import { NextResponse } from 'next/server';
import { query, QueryResult } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// کد OTP ثابت برای تست
const MOCK_OTP = '123456'; 

/**
 * @method POST
 * دریافت شماره تلفن و یا تایید کد OTP
 */
export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone) {
            return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
        }

        // --- مرحله اول: ارسال/شبیه‌سازی OTP ---
        if (!otp) {
            // اضافه کردن فیلدهای جدید
            const users = await query<{ id: number, name: string, plan_key: string }>('SELECT id, name, plan_key FROM users WHERE phone = ?', [phone]);
            const isRegistered = users.length > 0;
            
            if (!isRegistered) {
                // ثبت موقت کاربر جدید (پلن پیش‌فرض: free_trial)
                // ⭐️ اضافه کردن purchased_sms_credit = 0 ⭐️
                const result = await query<QueryResult>('INSERT INTO users (phone, plan_key, purchased_sms_credit) VALUES (?, ?, 0)', [phone, 'free_trial']);
                const newUserId = result[0].insertId;
                
                return NextResponse.json({ 
                    message: 'New user created. OTP sent successfully (Mock: 123456). Please verify OTP.', 
                    isRegistered: false,
                    otp: MOCK_OTP, 
                    userId: newUserId 
                });
            }

            console.log(`Sending mock OTP ${MOCK_OTP} to ${phone}`);
            return NextResponse.json({ 
                message: 'OTP sent successfully (Mock: 123456). Please verify OTP.', 
                isRegistered: true,
                otp: MOCK_OTP 
            });
        }
        
        // --- مرحله دوم: تایید OTP و لاگین ---
        if (otp !== MOCK_OTP) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 401 });
        }
        
        // فیلدهای جدید برای بررسی وضعیت پلن
        const users = await query<{ 
            id: number, 
            job_id: number | null, 
            name: string | null, 
            plan_key: string, 
            trial_starts_at: string | null 
        }>('SELECT id, job_id, name, plan_key, trial_starts_at FROM users WHERE phone = ?', [phone]);
        
        if (users.length === 0) {
            return NextResponse.json({ message: 'User not found after verification' }, { status: 404 });
        }
        
        const user = users[0];
        const token = generateToken(user.id);
        
        // ⭐️⭐️ تنظیم کوکی امن HTTP-Only ⭐️⭐️
        (await
            // ⭐️⭐️ تنظیم کوکی امن HTTP-Only ⭐️⭐️
            cookies()).set('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60, // 7 روز
                path: '/',
                sameSite: 'lax',
        });
        
        // بررسی تکمیل ثبت نام
        const signupComplete = !!user.name && !!user.job_id;

        // ⭐️⭐️ منطق فعال‌سازی پلن تریال در اولین لاگین ⭐️⭐️
        if (user.plan_key === 'free_trial' && !user.trial_starts_at) {
            const today = new Date().toISOString().split('T')[0];
            
            // quota_ends_at: ۱ ماه بعد (برای ریست ماهانه ۱۵۰ پیامک)
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            const quotaEndsAt = oneMonthLater.toISOString().split('T')[0];
            
            // trial_ends_at: ۳ ماه بعد (انقضای کلی پلن)
            const threeMonthsLater = new Date();
            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
            const trialEndsAt = threeMonthsLater.toISOString().split('T')[0];
            
            // فعال‌سازی تریال (۱۵۰ پیامک ماه اول) و تنظیم موجودی
            await query<QueryResult>(
                `UPDATE users 
SET sms_monthly_quota = ?, sms_balance = ?, trial_starts_at = ?, trial_ends_at = ?, quota_starts_at = ?, quota_ends_at = ?
WHERE id = ?`, 
                [
                    150, // سهمیه ماهانه (مطابق پلن free_trial)
                    150, // موجودی اولیه (برای شروع تریال)
                    today, // trial_starts_at
                    trialEndsAt, // trial_ends_at
                    today, // quota_starts_at
                    quotaEndsAt, // 👈 ۱ ماه بعد برای ریست ماهانه
                    user.id
                ]
            );

            // ❌ حذف ثبت رکورد اشتباه خرید ۴۵۰ پیامک در smspurchase که قبلاً وجود داشت ❌
        }

        return NextResponse.json({ 
            message: 'Login successful', 
            signup_complete: signupComplete,
            userId: user.id 
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An error occurred during authentication' }, { status: 500 });
    }
}