// File Path: src\app\api\client\auth\check\route.ts

// src/app/api/auth/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * @method GET
 * بررسی وضعیت لاگین و وضعیت تکمیل ثبت‌نام با استفاده از کوکی authToken
 */
export async function GET() {
    try {
        const token = (await cookies()).get('authToken')?.value;

        if (!token) {
            return NextResponse.json({ isAuthenticated: false, message: 'No token provided' }, { status: 401 });
        }

        const userId = verifyToken(token);

        if (!userId) {
            // توکن نامعتبر یا منقضی است
            (await
                // توکن نامعتبر یا منقضی است
                cookies()).delete('authToken');
            return NextResponse.json({ isAuthenticated: false, message: 'Invalid token' }, { status: 401 });
        }
        
        // خواندن اطلاعات از دیتابیس برای چک کردن تکمیل ثبت‌نام
        const users = await query<{ job_id: number | null, name: string | null }>('SELECT job_id, name FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
             // این نباید رخ دهد اگر کاربر از طریق login ثبت شده باشد
             return NextResponse.json({ isAuthenticated: false, message: 'User not found' }, { status: 404 });
        }
        
        const user = users[0];
        const signupComplete = !!user.name && !!user.job_id;
        
        // اگر ثبت‌نام ناقص است، اطلاعات را برگردان
        if (!signupComplete) {
            return NextResponse.json({ 
                isAuthenticated: true, 
                signupComplete: false,
                userId 
            }, { status: 200 });
        }

        // توکن معتبر و ثبت‌نام کامل است
        return NextResponse.json({ 
            isAuthenticated: true, 
            signupComplete: true,
            userId 
        });

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ isAuthenticated: false, message: 'Internal server error' }, { status: 500 });
    }
}