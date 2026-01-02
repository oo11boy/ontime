import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db'; 

const ADMIN_COOKIE_NAME = 'adminAuthToken';

/**
 * @method GET
 * بررسی وضعیت نشست (Session) ادمین و تایید هویت در دیتابیس
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

        // ۱. اگر توکنی وجود ندارد
        if (!token) {
            return NextResponse.json({ isAuthenticated: false, message: 'توکن یافت نشد.' }, { status: 401 });
        }

        // ۲. تایید اعتبار توکن (JWT)
        const adminId = verifyToken(token); 

        if (!adminId) {
            // اگر توکن منقضی یا دستکاری شده بود، کوکی را پاک کن
            cookieStore.delete(ADMIN_COOKIE_NAME);
            return NextResponse.json({ isAuthenticated: false, message: 'توکن نامعتبر یا منقضی.' }, { status: 401 });
        }

        // ۳. تایید نهایی وجود ادمین در دیتابیس (برای امنیت حداکثری)
        const admins = await query<{ id: number; role: string; name: string }>(
            'SELECT id, role, name FROM admins WHERE id = ?', 
            [adminId]
        );

        if (admins.length === 0) {
            cookieStore.delete(ADMIN_COOKIE_NAME);
            return NextResponse.json({ isAuthenticated: false, message: 'کاربر ادمین نامعتبر.' }, { status: 401 });
        }

        // ۴. بازگرداندن اطلاعات ادمین
        return NextResponse.json({ 
            isAuthenticated: true,
            isAdmin: true,
            adminId: admins[0].id,
            name: admins[0].name,
            role: admins[0].role
        }, { status: 200 });

    } catch (error) {
        console.error('Admin Auth Check Error:', error);
        return NextResponse.json({ isAuthenticated: false, message: 'خطای سرور.' }, { status: 500 });
    }
}