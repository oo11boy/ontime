// src/app/api/admin/user-management/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

// ============================================================
// GET - دریافت لیست کاربران با فیلترهای پیشرفته
// ============================================================
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const filter = url.searchParams.get("filter") || "all";
    const sort = url.searchParams.get("sort") || "newest"; // newest, oldest, expiry_asc, expiry_desc
    const callStatus = url.searchParams.get("callStatus") || "all"; // called, not_called, all
    const dateRange = url.searchParams.get("dateRange") || "all"; // today, week, month, all

    let whereClause = "1=1";
    const params: any[] = [];

    // 1. فیلتر ثبت‌نام کامل/ناقص
    if (filter === "complete") {
      whereClause += ` AND u.business_name IS NOT NULL AND u.business_name != '' AND u.job_id IS NOT NULL`;
    } else if (filter === "incomplete") {
      whereClause += ` AND (u.business_name IS NULL OR u.business_name = '' OR u.job_id IS NULL)`;
    }

    // 2. فیلتر انقضا
    else if (filter === "expired") {
      whereClause += ` AND u.ended_at IS NOT NULL AND u.ended_at < NOW()`;
    } else if (filter === "expiring_soon") {
      whereClause += ` AND u.ended_at IS NOT NULL AND u.ended_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`;
    } else if (filter === "expired_not_notified") {
      whereClause += ` AND u.ended_at IS NOT NULL AND u.ended_at < NOW() AND u.has_received_expired_notification = 0`;
    } else if (filter === "expired_notified") {
      whereClause += ` AND u.ended_at IS NOT NULL AND u.ended_at < NOW() AND u.has_received_expired_notification = 1`;
    }

    // 3. فیلتر وضعیت تماس
    if (callStatus !== "all") {
      whereClause += ` AND u.call_status = ?`;
      params.push(callStatus);
    }

    // 4. فیلتر تاریخ ثبت‌نام
    if (dateRange === "today") {
      whereClause += ` AND DATE(u.created_at) = CURDATE()`;
    } else if (dateRange === "week") {
      whereClause += ` AND u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    } else if (dateRange === "month") {
      whereClause += ` AND u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    }

    // 5. جستجو
    if (search) {
      whereClause += ` AND (u.name LIKE ? OR u.phone LIKE ? OR u.business_name LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // 6. مرتب‌سازی
    let orderBy = "u.id DESC";
    if (sort === "oldest") {
      orderBy = "u.id ASC";
    } else if (sort === "expiry_asc") {
      orderBy = "u.ended_at ASC";
    } else if (sort === "expiry_desc") {
      orderBy = "u.ended_at DESC";
    }

    // کوئری اصلی با JOIN‌ها
    const users = await query<any>(
      `
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.business_name,
        u.plan_key,
        u.sms_monthly_quota,
        u.sms_balance,
        u.started_at,
        u.ended_at,
        u.quota_starts_at,
        u.quota_ends_at,
        u.has_used_free_trial,
        u.has_received_expiry_notification,
        u.has_received_expired_notification,
        u.created_at as registrationDate,
        u.call_status,
        u.call_note,
        p.title as plan_title,
        j.persian_name as jobTitle,
        CASE 
          WHEN u.business_name IS NOT NULL AND u.business_name != '' AND u.job_id IS NOT NULL 
          THEN 1 ELSE 0 
        END as hasCompleteProfile,
        (SELECT COUNT(*) FROM clients WHERE user_id = u.id) as customerCount,
        u.sms_balance as totalRemainingSms,
        u.sms_balance as planBalance,
        0 as purchasedPackagesBalance,
        CASE 
          WHEN u.ended_at IS NULL OR u.ended_at > NOW() THEN 'active'
          ELSE 'expired'
        END as status
      FROM users u
      LEFT JOIN plans p ON u.plan_key = p.plan_key
      LEFT JOIN jobs j ON u.job_id = j.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      `,
      params
    );

    // محاسبه آمار
    const allUsers = await query<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN business_name IS NOT NULL AND business_name != '' AND job_id IS NOT NULL THEN 1 ELSE 0 END) as complete,
        SUM(CASE WHEN business_name IS NULL OR business_name = '' OR job_id IS NULL THEN 1 ELSE 0 END) as incomplete
      FROM users
    `);

    const expiredUsers = await query<any>(`
      SELECT COUNT(*) as count FROM users WHERE ended_at IS NOT NULL AND ended_at < NOW()
    `);

    const expiringUsers = await query<any>(`
      SELECT COUNT(*) as count FROM users 
      WHERE ended_at IS NOT NULL AND ended_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
    `);

    const expiredNotNotified = await query<any>(`
      SELECT COUNT(*) as count FROM users 
      WHERE ended_at IS NOT NULL AND ended_at < NOW() AND has_received_expired_notification = 0
    `);

    const stats = {
      total: allUsers[0]?.total || 0,
      complete: allUsers[0]?.complete || 0,
      incomplete: allUsers[0]?.incomplete || 0,
      expired: expiredUsers[0]?.count || 0,
      expiringSoon: expiringUsers[0]?.count || 0,
      expiredNotNotified: expiredNotNotified[0]?.count || 0,
    };

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
}, ["super_admin", "editor"]);

// ============================================================
// PATCH - به‌روزرسانی وضعیت تماس و یادداشت
// ============================================================
export const PATCH = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { userId, callStatus, callNote, callReason } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "شناسه کاربر الزامی است" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE users 
       SET call_status = ?, call_note = ?, call_reason = ? 
       WHERE id = ?`,
      [callStatus, callNote, callReason || null, userId]
    );

    return NextResponse.json({
      success: true,
      message: "وضعیت تماس با موفقیت ذخیره شد",
    });
  } catch (error) {
    console.error("Error updating call status:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ذخیره‌سازی وضعیت تماس" },
      { status: 500 }
    );
  }
}, ["super_admin", "editor"]);

// ============================================================
// PUT - به‌روزرسانی اطلاعات کاربر
// ============================================================
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id, name, phone, job_id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه کاربر الزامی است" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE users 
       SET name = ?, phone = ?, job_id = ? 
       WHERE id = ?`,
      [name || null, phone, job_id || null, id]
    );

    return NextResponse.json({
      success: true,
      message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "خطا در به‌روزرسانی اطلاعات" },
      { status: 500 }
    );
  }
}, ["super_admin", "editor"]);

// ============================================================
// DELETE - حذف کاربر
// ============================================================
export const DELETE = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه کاربر الزامی است" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM users WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف کاربر" },
      { status: 500 }
    );
  }
}, ["super_admin", "editor"]);