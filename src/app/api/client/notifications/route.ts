// src/app/api/client/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * دریافت لیست اعلان‌های مربوط به کاربر لاگین شده
 * GET /api/client/notifications
 * 
 * منطق دسترسی:
 * - رییس: همه نوتیفیکیشن‌های مربوط به کسب‌وکار خودش
 * - پرسنل مستقل: فقط نوتیفیکیشن‌های مربوط به نوبت‌های خودش
 * - پرسنل هماهنگ: نوتیفیکیشن‌های مربوط به نوبت‌های خودش + نوبت‌های رییس
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // دریافت نوع کاربر و staffId از کوکی
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    let notifications = [];

    // ========== حالت پرسنل ==========
    if (userType === "staff" && staffId) {
      // دریافت تنظیمات پرسنل
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );

      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        // ========== پرسنل مستقل: فقط نوتیفیکیشن‌های نوبت‌های خودش ==========
        notifications = await query(
          `SELECT 
            n.id, 
            n.type, 
            n.message, 
            n.is_read, 
            DATE_FORMAT(n.created_at, '%H:%i') as time,
            (n.created_at >= NOW() - INTERVAL 5 MINUTE) as is_recent
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND b.staff_id = ?
            AND n.is_read = 0
          ORDER BY n.created_at DESC 
          LIMIT 15`,
          [userId, parseInt(staffId)]
        );
      } else {
        // ========== پرسنل هماهنگ (synced): نوتیفیکیشن‌های نوبت‌های خودش + نوبت‌های رییس ==========
        notifications = await query(
          `SELECT 
            n.id, 
            n.type, 
            n.message, 
            n.is_read, 
            DATE_FORMAT(n.created_at, '%H:%i') as time,
            (n.created_at >= NOW() - INTERVAL 5 MINUTE) as is_recent
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND (b.staff_id IS NULL OR b.staff_id = ?)
            AND n.is_read = 0
          ORDER BY n.created_at DESC 
          LIMIT 15`,
          [userId, parseInt(staffId)]
        );
      }
    } 
    // ========== حالت رییس (کاربر عادی) ==========
    else {
      // رییس: همه نوتیفیکیشن‌های کسب‌وکار (نوبت‌های خودش + نوبت‌های همه پرسنل)
      notifications = await query(
        `SELECT 
          n.id, 
          n.type, 
          n.message, 
          n.is_read, 
          DATE_FORMAT(n.created_at, '%H:%i') as time,
          (n.created_at >= NOW() - INTERVAL 5 MINUTE) as is_recent
        FROM notifications n
        WHERE n.user_id = ? 
          AND n.is_read = 0
        ORDER BY n.created_at DESC 
        LIMIT 15`,
        [userId]
      );
    }

    // محاسبه تعداد کل نوتیفیکیشن‌های نخوانده برای نمایش در هدر
    let unreadCount = notifications.length;
    
    // اگر پرسنل مستقل است، تعداد کل نخوانده‌ها را محاسبه کن (برای نمایش در هدر)
    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );
      
      const calendarType = staff?.[0]?.calendar_type;
      
      if (calendarType === "independent") {
        const countResult = await query<any>(
          `SELECT COUNT(*) as count
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND b.staff_id = ?
            AND n.is_read = 0`,
          [userId, parseInt(staffId)]
        );
        unreadCount = countResult[0]?.count || 0;
      } else {
        const countResult = await query<any>(
          `SELECT COUNT(*) as count
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND (b.staff_id IS NULL OR b.staff_id = ?)
            AND n.is_read = 0`,
          [userId, parseInt(staffId)]
        );
        unreadCount = countResult[0]?.count || 0;
      }
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error in GET notifications:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اعلان‌ها" },
      { status: 500 }
    );
  }
});

/**
 * آپدیت وضعیت خوانده شدن اعلان‌ها
 * POST /api/client/notifications
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // دریافت نوع کاربر و staffId از کوکی
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    // ========== حالت پرسنل ==========
    if (userType === "staff" && staffId) {
      // دریافت تنظیمات پرسنل
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );

      const calendarType = staff?.[0]?.calendar_type;

      if (markAllAsRead) {
        if (calendarType === "independent") {
          // پرسنل مستقل: فقط نوتیفیکیشن‌های نوبت‌های خودش را علامت بزن
          await query(
            `UPDATE notifications n
            INNER JOIN booking b ON n.booking_id = b.id
            SET n.is_read = 1 
            WHERE n.user_id = ? 
              AND b.staff_id = ?
              AND n.is_read = 0`,
            [userId, parseInt(staffId)]
          );
        } else {
          // پرسنل هماهنگ: نوتیفیکیشن‌های نوبت‌های خودش + رییس را علامت بزن
          await query(
            `UPDATE notifications n
            INNER JOIN booking b ON n.booking_id = b.id
            SET n.is_read = 1 
            WHERE n.user_id = ? 
              AND (b.staff_id IS NULL OR b.staff_id = ?)
              AND n.is_read = 0`,
            [userId, parseInt(staffId)]
          );
        }
      } else if (notificationId) {
        // علامت‌گذاری یک اعلان خاص با بررسی دسترسی
        if (calendarType === "independent") {
          await query(
            `UPDATE notifications n
            INNER JOIN booking b ON n.booking_id = b.id
            SET n.is_read = 1 
            WHERE n.id = ? 
              AND n.user_id = ? 
              AND b.staff_id = ?`,
            [notificationId, userId, parseInt(staffId)]
          );
        } else {
          await query(
            `UPDATE notifications n
            INNER JOIN booking b ON n.booking_id = b.id
            SET n.is_read = 1 
            WHERE n.id = ? 
              AND n.user_id = ? 
              AND (b.staff_id IS NULL OR b.staff_id = ?)`,
            [notificationId, userId, parseInt(staffId)]
          );
        }
      }
    } 
    // ========== حالت رییس ==========
    else {
      if (markAllAsRead) {
        await query(
          "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
          [userId]
        );
      } else if (notificationId) {
        await query(
          "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
          [notificationId, userId]
        );
      }
    }

    // دریافت تعداد جدید نوتیفیکیشن‌های نخوانده
    let newUnreadCount = 0;
    
    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );
      const calendarType = staff?.[0]?.calendar_type;
      
      if (calendarType === "independent") {
        const countResult = await query<any>(
          `SELECT COUNT(*) as count
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND b.staff_id = ?
            AND n.is_read = 0`,
          [userId, parseInt(staffId)]
        );
        newUnreadCount = countResult[0]?.count || 0;
      } else {
        const countResult = await query<any>(
          `SELECT COUNT(*) as count
          FROM notifications n
          INNER JOIN booking b ON n.booking_id = b.id
          WHERE n.user_id = ? 
            AND (b.staff_id IS NULL OR b.staff_id = ?)
            AND n.is_read = 0`,
          [userId, parseInt(staffId)]
        );
        newUnreadCount = countResult[0]?.count || 0;
      }
    } else {
      const countResult = await query<any>(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [userId]
      );
      newUnreadCount = countResult[0]?.count || 0;
    }

    return NextResponse.json({
      success: true,
      message: "وضعیت با موفقیت بروزرسانی شد",
      unreadCount: newUnreadCount,
    });
  } catch (error: any) {
    console.error("Error in POST notifications:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی اعلان" },
      { status: 500 }
    );
  }
});