import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

/**
 * دریافت اطلاعات تنظیمات کاربر
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const users = await query<any[]>(
      `SELECT 
        name, 
        business_name, 
        business_address, 
        phone, 
        job_id,
        work_shifts,
        off_days
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
});

/**
 * بروزرسانی تنظیمات کاربر
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const body = await req.json();
    const {
      name,
      business_name,
      business_address,
      phone,
      job_id,
      work_shifts, // این فیلد به صورت رشته JSON دریافت می‌شود
      off_days, // این فیلد به صورت رشته JSON دریافت می‌شود
    } = body;

    // اعتبار سنجی فیلدهای الزامی اصلی
    if (!name || !phone || !job_id) {
      return NextResponse.json(
        { message: "نام، شماره تماس و نوع تخصص الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن شماره موبایل (اگر کاربر شماره خود را تغییر داده باشد)
    const existingUser = await query<any[]>(
      "SELECT id FROM users WHERE phone = ? AND id != ?",
      [phone, userId]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "این شماره تماس قبلاً توسط شخص دیگری ثبت شده است" },
        { status: 400 }
      );
    }

    // بروزرسانی دیتابیس
    await query(
      `UPDATE users 
       SET name = ?, 
           business_name = ?, 
           business_address = ?, 
           phone = ?, 
           job_id = ?, 
           work_shifts = ?, 
           off_days = ? 
       WHERE id = ?`,
      [
        name,
        business_name || null,
        business_address || null,
        phone,
        job_id,
        work_shifts || null,
        off_days || null,
        userId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "تنظیمات با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json(
      { message: "خطا در بروزرسانی اطلاعات دیتابیس" },
      { status: 500 }
    );
  }
});
