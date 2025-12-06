// src/app/api/smstemplates/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * دریافت لیست قالب‌های پیامکی سفارشی کاربر و عمومی
 */
const getSmsTemplates = withAuth(async (req: Request, userId: number) => {
    try {
        // دریافت قالب‌هایی که توسط کاربر ایجاد شده یا عمومی هستند (user_id IS NULL)
        const sql = `
            SELECT 
                id, 
                title, 
                content
            FROM smstemplates 
            WHERE user_id = ? OR user_id IS NULL 
            ORDER BY id
        `;
        
        const templates = await query<any>(sql, [userId]);
        
        return NextResponse.json({ 
            message: 'SMS templates fetched successfully', 
            templates 
        });

    } catch (error) {
        console.error("Failed to fetch SMS templates:", error);
        return NextResponse.json({ message: 'Failed to fetch SMS templates' }, { status: 500 });
    }
});

export { getSmsTemplates as GET };