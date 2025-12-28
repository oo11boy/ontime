// src/app/api/client/dashboard/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // ۱. بررسی و تمدید خودکار سهمیه (Lazy Refresh)
    // ابتدا چک می‌کنیم آیا زمان تمدید ۱۵۰ پیامک ماهانه رسیده است یا خیر
    const userStatus = await query<any>(
      "SELECT sms_monthly_quota, quota_ends_at, ended_at FROM users WHERE id = ?",
      [userId]
    );

    if (userStatus.length > 0) {
      const { sms_monthly_quota, quota_ends_at, ended_at } = userStatus[0];
      const today = new Date();
      const quotaEndDate = new Date(quota_ends_at);
      const planEndDate = new Date(ended_at);

      // اگر تاریخ سهمیه ماهانه منقضی شده ولی هنوز در بازه کل پلن (مثلا ۲ ماهه) هستیم
      if (today >= quotaEndDate && today <= planEndDate) {
        const todayStr = today.toISOString().split("T")[0];

        // محاسبه پایان سهمیه برای ماه جدید (یک ماه بعد از تاریخ انقضای قبلی)
        const nextQuotaEndDate = new Date(quotaEndDate);
        nextQuotaEndDate.setMonth(nextQuotaEndDate.getMonth() + 1);
        const nextQuotaStr = nextQuotaEndDate.toISOString().split("T")[0];

        // بروزرسانی سهمیه در دیتابیس
        await query(
          `UPDATE users 
           SET sms_balance = ?, 
               quota_starts_at = ?, 
               quota_ends_at = ? 
           WHERE id = ?`,
          [sms_monthly_quota, todayStr, nextQuotaStr, userId]
        );

        // ثبت یک تراکنش سیستمی برای سوابق تمدید
        await query(
          `INSERT INTO smspurchase 
           (user_id, type, amount_paid, sms_amount, valid_from, valid_until, status)
           VALUES (?, 'monthly_renewal', 0, ?, ?, ?, 'active')`,
          [userId, sms_monthly_quota, todayStr, nextQuotaStr]
        );
      }
    }

    // ۲. کوئری اصلی برای دریافت اطلاعات کامل داشبورد
    const mainSql = `
      SELECT 
        u.name, 
        u.phone, 
        u.has_used_free_trial,
        j.persian_name AS job_title,
        u.sms_balance,
        u.purchased_sms_credit,
        u.sms_monthly_quota,
        p.title AS plan_title,
        p.price_per_100_sms,
        u.plan_key,
        u.quota_ends_at,
        u.started_at,
        u.ended_at,
        COALESCE(SUM(CASE 
          WHEN sp.type = 'one_time_sms' 
            AND sp.status = 'active'
            AND (sp.expires_at IS NULL OR sp.expires_at >= CURDATE())
          THEN sp.sms_amount 
          ELSE 0 
        END), 0) AS purchased_packages_total
      FROM users u
      LEFT JOIN jobs j ON u.job_id = j.id
      LEFT JOIN plans p ON u.plan_key = p.plan_key
      LEFT JOIN smspurchase sp ON sp.user_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
      LIMIT 1
    `;

    const mainResult = await query<any>(mainSql, [userId]);

    if (mainResult.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = mainResult[0];

    // ۳. کوئری دوم: لیست بسته‌های اضافی خریداری‌شده توسط کاربر
    const packagesSql = `
      SELECT 
        id,
        sms_amount,
        remaining_sms,
        valid_from,
        expires_at,
        amount_paid,
        ref_number,
        created_at
      FROM smspurchase
      WHERE user_id = ?
        AND type = 'one_time_sms'
      ORDER BY created_at DESC
    `;

    const packagesResult = await query<any>(packagesSql, [userId]);

    // اضافه کردن لیست بسته‌ها به شیء کاربر
    user.purchased_packages = packagesResult;

    return NextResponse.json({
      message: "Dashboard data fetched and updated successfully",
      user,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
});

export { handler as GET };
