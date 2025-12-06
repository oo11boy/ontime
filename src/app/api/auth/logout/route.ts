// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

/**
 * @method POST
 * خروج از حساب کاربری (Logout)
 * این عملیات با حذف کوکی‌های احراز هویت در سمت کلاینت انجام می‌شود.
 */
export async function POST(req: Request) {
    try {
        const response = NextResponse.json({ 
            message: 'Logout successful. Please remove JWT token from local storage/cookies.' 
        }, { 
            status: 200 
        });

        // 💡 فرض بر این است که توکن JWT در سمت کلاینت درون یک کوکی با نام 'authToken' ذخیره شده است.
        // اگر در کدهای سمت کلاینت، توکن را در 'localStorage' ذخیره می‌کنید، این API فقط یک پیام موفقیت‌آمیز برمی‌گرداند 
        // و حذف توکن باید توسط کد کلاینت انجام شود. اما اگر از کوکی استفاده می‌کنید، این کد آن را حذف می‌کند:
        
        // حذف کوکی با تنظیم Max-Age به 0 و تاریخ انقضا در گذشته
        response.cookies.set('authToken', '', { 
            httpOnly: true, // امنیت بیشتر
            secure: process.env.NODE_ENV === 'production', // فقط در HTTPS در محیط پروداکشن
            maxAge: 0, 
            expires: new Date(0), // تاریخ انقضا در گذشته
            path: '/' // اعمال بر کل دامنه
        });
        
        return response;

    } catch (error) {
        console.error("Logout failed:", error);
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
    }
}