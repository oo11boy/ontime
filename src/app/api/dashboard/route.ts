// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * نمایش اطلاعات یوزر (نام، شغل، پیامک‌های باقیمانده، پلن و...)
 */
const getDashboardData = withAuth(async (req: Request, userId: number) => {
    try {
        const sql = `
            SELECT 
                u.name, 
                u.phone, 
                j.persian_name AS job_title,
                u.sms_balance,
                u.sms_monthly_quota,
                p.title AS plan_title,
                u.plan_key
            FROM users u
            LEFT JOIN jobs j ON u.job_id = j.id
            LEFT JOIN plans p ON u.plan_key = p.plan_key
            WHERE u.id = ?
        `;
        
        const users = await query<any>(sql, [userId]);
        
        if (users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const userData = users[0];
        
        return NextResponse.json({ 
            message: 'User data fetched successfully', 
            user: userData 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch dashboard data' }, { status: 500 });
    }
});

export { getDashboardData as GET };