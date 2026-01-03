// src\app\api\client\settings\route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

// دریافت اطلاعات فعلی کاربر (شامل نام کسب‌وکار و آدرس)
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const users = await query<any[]>(
      `SELECT 
        name, 
        business_name, 
        business_address, 
        phone, 
        job_id 
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
    console.error("Fetch Profile Error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
});

// آپدیت اطلاعات کاربر (نام، نام کسب‌وکار، آدرس کسب‌وکار، تلفن و شغل)
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { name, business_name, business_address, phone, job_id } =
      await req.json();

    // فیلدهای الزامی
    if (!name || !phone || !job_id) {
      return NextResponse.json(
        { message: "نام، شماره تماس و نوع تخصص الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن شماره موبایل برای کاربران دیگر
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

    // بروزرسانی دیتابیس شامل ستون‌های جدید business_name و business_address
    await query(
      `UPDATE users 
       SET name = ?, 
           business_name = ?, 
           business_address = ?, 
           phone = ?, 
           job_id = ? 
       WHERE id = ?`,
      [
        name,
        business_name || null,
        business_address || null, // آدرس اختیاریه، اگر خالی بود null ذخیره می‌شه
        phone,
        job_id,
        userId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "اطلاعات با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Settings Update Error:", error);
    return NextResponse.json(
      { message: "خطا در بروزرسانی اطلاعات" },
      { status: 500 }
    );
  }
});