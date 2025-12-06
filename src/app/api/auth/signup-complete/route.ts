// src/app/api/auth/signup-complete/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method POST
 * تکمیل ثبت نام کاربر (انتخاب نام و دسته شغلی)
 */
const signupComplete = withAuth(async (req: Request, userId: number) => {
    try {
        const { name, job_id } = await req.json();

        if (!name || !job_id) {
            return NextResponse.json({ message: 'Name and Job ID are required' }, { status: 400 });
        }

        // 1. به‌روزرسانی اطلاعات کاربر
        const sql = `
            UPDATE users 
            SET name = ?, job_id = ? 
            WHERE id = ? AND (name IS NULL OR job_id IS NULL)
        `;
        const result = await query<any>(sql, [name, job_id, userId]);
        
        if (result[0].affectedRows === 0) {
             // اگر affectedRows صفر باشد، ممکن است کاربر قبلاً ثبت نامش کامل شده باشد.
            return NextResponse.json({ message: 'Signup already complete or user not found' }, { status: 200 });
        }

        return NextResponse.json({ 
            message: 'Signup completed successfully. You can now access your dashboard.' 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to complete signup' }, { status: 500 });
    }
});

export { signupComplete as POST };