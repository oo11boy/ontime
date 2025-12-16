// File Path: src\app\api\admin\admin-auth\logout\route.ts

// src/app/api/admin-auth/logout/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'adminAuthToken';

export async function POST(req: Request) {
    try {
        // حذف کوکی مخصوص ادمین
        (await cookies()).delete(ADMIN_COOKIE_NAME);
        
        return NextResponse.json({ 
            message: 'Admin Logout successful. Authentication cookie has been removed.',
        }, { 
            status: 200 
        });

    } catch (error) {
        console.error("Admin Logout failed:", error);
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
    }
}