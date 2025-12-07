// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // برای تایپ بهتر

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECURE_NEXTJS_SECRET_KEY';

interface JwtPayload {
    userId: number;
}

export function generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): number | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// تایپ RouteContext در Next.js 15
export type RouteContext = {
    params: Promise<{ [key: string]: string | string[] }>; // async params
};

/**
 * withAuth HOC – سازگار با Next.js 15
 * handler حالا context رو با userId inject‌شده می‌گیره
 */
export function withAuth(
    handler: (req: NextRequest, context: RouteContext & { userId: number }) => Promise<NextResponse>
) {
    return async (req: NextRequest, context: RouteContext) => {
        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
        }

        const userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
        }

        // context رو با userId extend کن (بدون any زیاد)
        const extendedContext = { ...context, userId } as RouteContext & { userId: number };
        return handler(req, extendedContext);
    };
}