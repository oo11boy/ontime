// src/app/api/client/app-download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

// تابع کمکی برای دریافت userType و staffId از کوکی‌ها
async function getUserTypeAndStaffId() {
  const cookieStore = await cookies();
  const userType = cookieStore.get('user_type')?.value as 'user' | 'staff' | null;
  const staffId = cookieStore.get('staff_id')?.value;
  return { userType, staffId: staffId ? parseInt(staffId) : null };
}

// API برای ثبت وضعیت دانلود اپلیکیشن
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context; // userId از توکن احراز هویت اصلی (رییس)
  const { userType, staffId } = await getUserTypeAndStaffId();

  try {
    if (userType === 'staff' && staffId) {
      // اگر کاربر به عنوان پرسنل وارد شده، وضعیت دانلود را در جدول staffs آپدیت کن
      const staff = await query<any>(
        "SELECT id FROM staffs WHERE id = ? AND owner_user_id = ?",
        [staffId, userId]
      );

      if (staff.length === 0) {
        return NextResponse.json(
          { success: false, message: "پرسنل یافت نشد" },
          { status: 404 }
        );
      }

      await query(
        "UPDATE staffs SET app_downloaded_at = NOW() WHERE id = ?",
        [staffId]
      );

      return NextResponse.json({
        success: true,
        message: "وضعیت دانلود برای پرسنل ثبت شد",
        userType: 'staff',
        staffId: staffId
      });
    } 
    else {
      // در غیر این صورت (رییس یا حالت عادی)، وضعیت دانلود را در جدول users آپدیت کن
      await query(
        "UPDATE users SET app_downloaded_at = NOW() WHERE id = ?",
        [userId]
      );

      return NextResponse.json({
        success: true,
        message: "وضعیت دانلود برای کاربر ثبت شد",
        userType: 'user',
        userId: userId
      });
    }
  } catch (error) {
    console.error("POST /api/client/app-download error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت وضعیت دانلود" },
      { status: 500 }
    );
  }
});

// API برای بررسی وضعیت دانلود (آیا بنر باید نشان داده شود یا خیر)
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { userType, staffId } = await getUserTypeAndStaffId();

  try {
    let downloadedAt = null;

    if (userType === 'staff' && staffId) {
      // بررسی وضعیت دانلود برای پرسنل
      const staff = await query<any>(
        "SELECT app_downloaded_at FROM staffs WHERE id = ? AND owner_user_id = ?",
        [staffId, userId]
      );
      downloadedAt = staff[0]?.app_downloaded_at;
    } 
    else {
      // بررسی وضعیت دانلود برای رییس
      const user = await query<any>(
        "SELECT app_downloaded_at FROM users WHERE id = ?",
        [userId]
      );
      downloadedAt = user[0]?.app_downloaded_at;
    }

    // اگر app_downloaded_at مقدار داشته باشد، یعنی قبلاً دانلود کرده و بنر نباید نشان داده شود
    const shouldShowBanner = !downloadedAt;

    return NextResponse.json({
      success: true,
      shouldShowBanner,
      downloadedAt,
      userType
    });
  } catch (error) {
    console.error("GET /api/client/app-download error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بررسی وضعیت دانلود" },
      { status: 500 }
    );
  }
});