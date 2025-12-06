// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Secret Key برای JWT
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECURE_NEXTJS_SECRET_KEY';

interface JwtPayload {
    userId: number;
}

/**
 * ایجاد JWT برای یک کاربر
 * @param userId شناسه کاربری
 * @returns توکن JWT
 */
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * تایید توکن JWT و استخراج شناسه کاربری
 * @param token توکن JWT
 * @returns شناسه کاربری (number) یا null
 */
export function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

/**
 * Higher-Order Function (HOC) برای حفاظت از APIها
 * @param handler تابع اصلی API که req و userId را می‌گیرد
 * @returns تابع Next.js Route Handler
 */
export function withAuth(handler: (req: Request, userId: number, params?: any) => Promise<NextResponse>) {
    return async (req: Request, context: { params: any } = { params: {} }) => {
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
        }

        const userId = verifyToken(token);

        if (!userId) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
        }

        // انتقال پارامترهای پویا مانند [id] در App Router
        return handler(req, userId, context.params);
    };
}