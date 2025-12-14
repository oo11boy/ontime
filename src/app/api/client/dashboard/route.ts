// src/app/api/dashboard/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // کوئری اول: اطلاعات اصلی کاربر + جمع پیامک‌های خریداری‌شده
// کوئری اول: اطلاعات اصلی کاربر + جمع پیامک‌های خریداری‌شده
const mainSql = `
  SELECT 
    u.name, 
    u.phone, 
    j.persian_name AS job_title,
    u.sms_balance AS plan_sms_balance,
    u.sms_monthly_quota,
    p.title AS plan_title,
    u.plan_key,
    p.price_per_100_sms,
    u.trial_ends_at,
    COALESCE(SUM(sp.remaining_sms), 0) AS purchased_sms_credit,
    (u.sms_balance + COALESCE(SUM(sp.remaining_sms), 0)) AS total_sms_balance
  FROM users u
  LEFT JOIN jobs j ON u.job_id = j.id
  LEFT JOIN plans p ON u.plan_key = p.plan_key
  LEFT JOIN smspurchase sp ON sp.user_id = u.id 
    AND sp.type = 'one_time_sms' 
    AND sp.status = 'active'
    AND (sp.expires_at IS NULL OR sp.expires_at >= CURDATE())
  WHERE u.id = ?
  GROUP BY u.id
  LIMIT 1
`;

    const mainResult = await query<any>(mainSql, [userId]);

    if (mainResult.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = mainResult[0];

    // کوئری دوم: لیست جزئیات بسته‌های خریداری‌شده (فقط فعال‌ها)
    const packagesSql = `
      SELECT 
        id,
        sms_amount,
        remaining_sms,
        valid_from,
        expires_at,
        amount_paid
      FROM smspurchase
      WHERE user_id = ?
        AND type = 'one_time_sms'
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at >= CURDATE())
      ORDER BY created_at DESC
    `;

    const packagesResult = await query<any>(packagesSql, [userId]);

    // اضافه کردن لیست بسته‌ها به پاسخ
    user.purchased_packages = packagesResult;

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

export { handler as GET };