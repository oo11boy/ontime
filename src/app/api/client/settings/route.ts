import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

// دریافت اطلاعات فعلی کاربر
// دریافت اطلاعات فعلی کاربر
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const users = await query<any[]>(
      'SELECT name, phone, job_id FROM users WHERE id = ?',
      [userId]
    );
    return NextResponse.json({ success: true, user: users[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
});

// آپدیت اطلاعات کاربر
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { name, phone, job_id } = await req.json();

    if (!name || !phone || !job_id) {
      return NextResponse.json(
        { message: "تمامی فیلدها الزامی است" },
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

    await query(
      "UPDATE users SET name = ?, phone = ?, job_id = ? WHERE id = ?",
      [name, phone, job_id, userId]
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
