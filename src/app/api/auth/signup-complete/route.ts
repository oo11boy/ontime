// src/app/api/auth/signup-complete/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import type { RouteContext } from '@/lib/auth'; 

/**
 * @method POST
 * تکمیل ثبت نام کاربر (انتخاب نام و دسته شغلی)
 * این تابع توسط withAuth محافظت می‌شود و userId را از توکن کوکی دریافت می‌کند.
 */
const POST = withAuth(async (req: NextRequest, context: RouteContext & { userId: number }) => {
    const { userId } = context;

    try {
        const { name, job_id } = await req.json();
        
        if (!name || !job_id) {
            return NextResponse.json({ message: 'Name and Job ID are required' }, { status: 400 });
        }
        
        // اطمینان از اینکه job_id یک عدد صحیح است
        const jobIdNumber = parseInt(job_id, 10);
        if (isNaN(jobIdNumber)) {
            return NextResponse.json({ message: 'Invalid Job ID format' }, { status: 400 });
        }

        // به‌روزرسانی اطلاعات کاربر
        const sql = `
            UPDATE users
            SET name = ?, job_id = ?
            WHERE id = ?
        `;
        const result = await query<any>(sql, [name.trim(), jobIdNumber, userId]);
        
        if (result[0]?.affectedRows === 0) {
            console.warn(`No rows updated for user ${userId}. Data might be the same.`);
        }

        return NextResponse.json({
            message: 'Signup completed successfully. You can now access your dashboard.'
        });
    } catch (error) {
        console.error('Signup complete error:', error);
        return NextResponse.json({ message: 'Failed to complete signup due to server error.' }, { status: 500 });
    }
});

export { POST }; // صادرات مستقیم تابع با نام POST