import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    // ========== حالت پرسنل ==========
    if (userType === "staff" && staffId) {
      // 1. اطلاعات پرسنل
      const staffInfo = await query<any[]>(
        `SELECT s.*, u.id as owner_id, u.name as owner_name, u.business_name
         FROM staffs s
         JOIN users u ON s.owner_user_id = u.id
         WHERE s.id = ? AND s.is_active = 1`,
        [staffId]
      );

      if (!staffInfo || staffInfo.length === 0) {
        return NextResponse.json({ message: "Staff not found" }, { status: 404 });
      }

      const staff = staffInfo[0];

      // 2. اطلاعات اشتراک رییس (برای تعیین پایان زمان)
      const ownerPlan = await query<any[]>(
        `SELECT u.ended_at, u.started_at, u.plan_key, p.title as plan_title,
         u.sms_monthly_quota, u.sms_balance as owner_sms_balance
         FROM users u
         LEFT JOIN plans p ON u.plan_key = p.plan_key
         WHERE u.id = ?`,
        [staff.owner_id]
      );

      const owner = ownerPlan[0] || {};
      
      // بررسی اینکه آیا اشتراک رییس فعال است
      const today = new Date();
      const endedAt = owner.ended_at ? new Date(owner.ended_at) : null;
      const isOwnerPlanActive = endedAt ? today <= endedAt : false;

      // اگر اشتراک رییس تمام شده باشد، پرسنل هم نباید دسترسی داشته باشد
      if (!isOwnerPlanActive) {
        return NextResponse.json(
          { message: "اشتراک مجموعه شما به پایان رسیده است. لطفاً با مدیر مجموعه تماس بگیرید." },
          { status: 403 }
        );
      }

      return NextResponse.json({
        message: "Dashboard data for staff",
        user: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          role: "staff",
          staff_id: staff.id,
          owner_id: staff.owner_id,
          owner_name: staff.owner_name,
          business_name: staff.business_name,
          // اعتبار پیامک پرسنل
          sms_balance: staff.sms_balance,
          sms_used: staff.sms_used,
          total_sms_balance: staff.sms_balance,
          // تنظیمات پرسنل
          calendar_type: staff.calendar_type,
          can_see_all_clients: staff.can_see_all_clients === 1,
          service_ids: staff.service_ids,
          // اطلاعات پلن از رییس (برای نمایش)
          plan_title: owner.plan_title || "پرسنل",
          plan_key: owner.plan_key || "staff",
          ended_at: owner.ended_at,  // تاریخ پایان اشتراک رییس
          started_at: owner.started_at,
          quota_ends_at: owner.quota_ends_at,
          price_per_100_sms: 0,
          has_used_free_trial: true,
          purchased_sms_credit: 0,
          purchased_packages: [],
          // اضافه کردن وضعیت اشتراک رییس
          owner_plan_active: isOwnerPlanActive,
        },
      });
    }

    // ========== حالت کاربر عادی (همان کد قبلی) ==========
    const userStatus = await query<any>(
      "SELECT sms_monthly_quota, quota_ends_at, ended_at FROM users WHERE id = ?",
      [userId],
    );

    if (userStatus.length > 0) {
      const { sms_monthly_quota, quota_ends_at, ended_at } = userStatus[0];
      const today = new Date();
      const quotaEndDate = new Date(quota_ends_at);
      const planEndDate = new Date(ended_at);

      if (today >= quotaEndDate && today <= planEndDate) {
        const todayStr = today.toISOString().split("T")[0];
        const nextQuotaEndDate = new Date(quotaEndDate);
        nextQuotaEndDate.setMonth(nextQuotaEndDate.getMonth() + 1);
        const nextQuotaStr = nextQuotaEndDate.toISOString().split("T")[0];

        await query(
          `UPDATE users 
           SET sms_balance = ?, 
               quota_starts_at = ?, 
               quota_ends_at = ? 
           WHERE id = ?`,
          [sms_monthly_quota, todayStr, nextQuotaStr, userId],
        );

        await query(
          `INSERT INTO smspurchase 
           (user_id, type, amount_paid, sms_amount, valid_from, valid_until, status)
           VALUES (?, 'monthly_renewal', 0, ?, ?, ?, 'active')`,
          [userId, sms_monthly_quota, todayStr, nextQuotaStr],
        );
      }
    }

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
    user.purchased_packages = packagesResult;

    return NextResponse.json({
      message: "Dashboard data fetched and updated successfully",
      user,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
});

export { handler as GET };