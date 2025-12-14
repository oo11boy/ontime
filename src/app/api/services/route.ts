import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// دریافت لیست سرویس‌های کاربر
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const services = await query(
      "SELECT id, name, price, duration_minutes, is_active, created_at FROM user_services WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({
      success: true,
      services: services || []
    });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت خدمات" },
      { status: 500 }
    );
  }
});

// ایجاد سرویس جدید
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const { name, price, duration_minutes } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "نام خدمت الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن نام سرویس برای این کاربر
    const existing: any = await query(
      "SELECT id FROM user_services WHERE user_id = ? AND name = ?",
      [userId, name.trim()]
    );

    if (existing && Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "این خدمت قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const priceValue = price ? parseFloat(price) : 0;
    const durationValue = duration_minutes ? parseInt(duration_minutes) : 30;

    const result: any = await query(
      "INSERT INTO user_services (user_id, name, price, duration_minutes) VALUES (?, ?, ?, ?)",
      [userId, name.trim(), priceValue, durationValue]
    );

    // دریافت سرویس جدید
    const [newService]: any = await query(
      "SELECT id, name, price, duration_minutes, is_active FROM user_services WHERE id = ?",
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: "خدمت با موفقیت اضافه شد",
      service: newService
    });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ایجاد خدمت" },
      { status: 500 }
    );
  }
});