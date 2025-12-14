// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from './db'; // <--- لازم برای چک کردن نقش ادمین در دیتابیس

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
    userId: number;
}

export function generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * توکن را بررسی کرده و در صورت معتبر بودن، userId را برمی‌گرداند.
 * @returns number (userId) یا null
 */
export function verifyToken(token: string): number | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload; 
        return decoded.userId;
    } catch (error) {
        // 🌟 لاگ کردن خطا برای عیب‌یابی
        console.error("JWT Verification Failed:", error); 
        return null;
    }
}

// تایپ RouteContext در Next.js 15
export type RouteContext = {
    params: Promise<{ [key: string]: string | string[] }>;
};

/**
 * withAuth HOC – سازگار با Next.js 15 (برای کاربران عادی)
 * کوکی HTTP-Only 'authToken' را چک می‌کند.
 */
export function withAuth(
    handler: (req: NextRequest, context: RouteContext & { userId: number }) => Promise<NextResponse>
) {
    return async (req: NextRequest, context: RouteContext) => {
        
        const token = (await cookies()).get('authToken')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userId = verifyToken(token);
        if (!userId) {
            // توکن نامعتبر یا منقضی است، کوکی را پاک کن
            (await cookies()).delete('authToken');
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
        }

        // context رو با userId extend کن
        const extendedContext = { ...context, userId } as RouteContext & { userId: number };
        return handler(req, extendedContext);
    };
}


// ----------------------------------------------------
// --- توابع اختصاصی ادمین برای کنترل دسترسی مبتنی بر نقش ---
// ----------------------------------------------------

export type AdminRole = 'super_admin' | 'editor' | 'viewer';

export type AdminRouteContext = {
    userId: number;
    role: AdminRole;
};

/**
 * withAdminAuth HOC (برای مدیران)
 * کوکی 'adminAuthToken' را چک کرده و نقش کاربر را از دیتابیس تأیید می‌کند.
 */
export function withAdminAuth(
    handler: (req: NextRequest, context: AdminRouteContext) => Promise<NextResponse>,
    // نقش‌های مجاز برای اجرای این API (پیش‌فرض: super_admin و editor)
    allowedRoles: AdminRole[] = ['super_admin', 'editor'] 
) {
    return async (req: NextRequest) => {
        
        const ADMIN_COOKIE_NAME = 'adminAuthToken';
        const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ message: 'Admin authentication required' }, { status: 401 });
        }

        const adminId = verifyToken(token);
        if (!adminId) {
            // توکن نامعتبر یا منقضی است
            (await cookies()).delete(ADMIN_COOKIE_NAME);
            return NextResponse.json({ message: 'Invalid or expired admin token' }, { status: 403 });
        }

        try {
            // چک کردن نقش کاربر در دیتابیس
            const admins = await query<{ id: number; role: AdminRole }>(
                'SELECT role FROM admins WHERE id = ?', 
                [adminId]
            );

            if (admins.length === 0) {
                 return NextResponse.json({ message: 'Admin user not found' }, { status: 403 });
            }

            const adminRole = admins[0].role;

            if (!allowedRoles.includes(adminRole)) {
                // اگر نقش کاربر مجاز نباشد
                return NextResponse.json({ message: `Access denied. Role ${adminRole} is not permitted.` }, { status: 403 });
            }

            // ارسال اطلاعات احراز هویت (userId و role) به تابع اصلی هندلر
            const adminContext: AdminRouteContext = { userId: adminId, role: adminRole };
            return handler(req, adminContext);

        } catch (error) {
            console.error("Admin Auth DB Check Error:", error);
            return NextResponse.json({ message: 'Internal server error during auth check' }, { status: 500 });
        }
    };
}