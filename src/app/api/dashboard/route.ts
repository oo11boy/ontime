// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

/**
 * @method GET
 * دریافت اطلاعات داشبورد کاربر (نام، شغل، موجودی پیامک، پلن و...)
 */
const handler = withAuth(async (req: NextRequest, context) => {
    const { userId } = context; // userId از withAuth تزریق شده

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
            LIMIT 1
        `;

        const users = await query<any>(sql, [userId]);

        if (users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        return NextResponse.json({
            message: 'Dashboard data fetched successfully',
            user
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
});

// Export صحیح برای Next.js 15 App Router
export { handler as GET };