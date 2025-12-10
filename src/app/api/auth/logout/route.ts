// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // 👈 ایمپورت cookies

/**
 * @method POST
 * خروج از حساب کاربری (Logout)
 * با حذف کوکی‌های احراز هویت HTTP-Only انجام می‌شود.
 */
export async function POST(req: Request) {
    try {

        (await
         
            cookies()).delete('authToken');
        
        return NextResponse.json({ 
            message: 'Logout successful. Authentication cookie has been removed.',
        }, { 
            status: 200 
        });

    } catch (error) {
        console.error("Logout failed:", error);
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
    }
}