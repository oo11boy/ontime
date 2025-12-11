// src/app/api/admin-auth/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db'; 

const ADMIN_COOKIE_NAME = 'adminAuthToken';

export async function GET() {
    try {
        const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ message: 'توکن یافت نشد.' }, { status: 401 });
        }

        // *** اصلاح: verifyToken مستقیماً adminId را برمی‌گرداند ***
        const adminId = verifyToken(token); 

        if (!adminId) {
             return NextResponse.json({ message: 'توکن نامعتبر یا منقضی.' }, { status: 401 });
        }

        // تأیید نهایی وجود ادمین در جدول admins
        const admins = await query<{ id: number; role: string }>('SELECT id, role FROM admins WHERE id = ?', [adminId]);

        if (admins.length === 0) {
            // توکن معتبر است اما کاربر در جدول ادمین‌ها موجود نیست
            return NextResponse.json({ message: 'کاربر ادمین نامعتبر.' }, { status: 401 });
        }

        return NextResponse.json({ 
            message: 'احراز هویت ادمین موفق.',
            isAdmin: true,
            role: admins[0].role
        });

    } catch (error) {
        // خطای انقضای توکن یا نامعتبر بودن
        console.error('Admin Auth Check Error:', error);
        return NextResponse.json({ message: 'احراز هویت ناموفق.' }, { status: 401 });
    }
}