// File Path: src\app\api\admin\admin-auth\login\route.ts

// src/app/api/admin-auth/login/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // فرض بر وجود این Utility است
import { generateToken } from '@/lib/auth'; // فرض بر وجود این Utility است
import { cookies } from 'next/headers';

const MOCK_OTP = '123456';
const ADMIN_COOKIE_NAME = 'adminAuthToken'; // کوکی مجزا برای ادمین

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, otp, resend } = body;

        if (!phone) {
            return NextResponse.json({ message: 'شماره موبایل الزامی است.' }, { status: 400 });
        }

        // بررسی وجود ادمین در دیتابیس
        const admins = await query<{
            id: number;
            name: string;
            role: string;
        }>('SELECT id, name, role FROM admins WHERE phone = ?', [phone]);

        if (admins.length === 0) {
            return NextResponse.json({ 
                message: 'شماره موبایل ثبت‌شده در بخش مدیریت نیست.' 
            }, { status: 403 });
        }
        
        const adminUser = admins[0];

        // مرحله ارسال OTP (یا ارسال مجدد)
        if (!otp || resend) {
            // در بخش ادمین، همیشه کد را ارسال می‌کند (حالت تست: 123456)
            return NextResponse.json({
                message: 'کد تأیید ارسال شد (تست: 123456)',
                otp: MOCK_OTP
            });
        }

        // مرحله تأیید OTP
        if (otp !== MOCK_OTP) {
            return NextResponse.json({ message: 'کد تأیید اشتباه است.' }, { status: 401 });
        }
        
        // لاگین موفق: ساخت توکن
        const token = generateToken(adminUser.id); // فرض می‌کنیم generateToken فقط user_id را در payload قرار می‌دهد

        // تنظیم کوکی adminAuthToken
        (await cookies()).set(ADMIN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({
            message: `ورود ادمین موفقیت‌آمیز بود. نقش: ${adminUser.role}`,
            role: adminUser.role,
        });

    } catch (error: any) {
        console.error('Admin Auth Error:', error);
        return NextResponse.json({ message: 'خطا در سرور.' }, { status: 500 });
    }
}