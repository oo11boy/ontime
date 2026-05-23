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
// src/app/api/client/settings/route.ts (بخش POST را آپدیت می‌کنیم)
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
      work_shifts,
      off_days,
    } = body;

    if (!name || !phone || !job_id) {
      return NextResponse.json(
        { message: "نام، شماره تماس و نوع تخصص الزامی است" },
        { status: 400 }
      );
    }

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

    // همچنین اگر لینک اختصاصی وجود دارد، آن را هم آپدیت می‌کنیم
    const customerLink = await query(
      "SELECT id FROM customer_links WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );

    if (customerLink && customerLink.length > 0) {
      await query(
        `UPDATE customer_links 
         SET business_name = COALESCE(?, business_name),
             business_address = COALESCE(?, business_address),
             work_shifts = COALESCE(?, work_shifts),
             off_days = COALESCE(?, off_days),
             updated_at = NOW()
         WHERE user_id = ? AND is_deleted = 0`,
        [
          business_name || null,
          business_address || null,
          work_shifts || null,
          off_days || null,
          userId
        ]
      );
    }

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
