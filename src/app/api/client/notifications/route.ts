import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

/**
 * دریافت لیست اعلان‌های مربوط به کاربر لاگین شده
 * GET /api/client/notifications
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // واکشی ۱۵ اعلان آخر
    // اضافه شدن منطق is_recent: اگر اعلان در ۵ دقیقه اخیر ساخته شده باشد مقدار ۱ برمی‌گرداند
    const notifications = await query(
      `SELECT 
        id, 
        type, 
        message, 
        is_read, 
        DATE_FORMAT(created_at, '%H:%i') as time,
        (created_at >= NOW() - INTERVAL 5 MINUTE) as is_recent
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 15`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
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

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // علامت‌گذاری تمام اعلان‌های نخوانده کاربر به عنوان خوانده شده
      await query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [userId]
      );
    } else if (notificationId) {
      // علامت‌گذاری یک اعلان خاص
      await query(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        [notificationId, userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "وضعیت با موفقیت بروزرسانی شد",
    });
  } catch (error: any) {
    console.error("Error in POST notifications:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی اعلان" },
      { status: 500 }
    );
  }
});
