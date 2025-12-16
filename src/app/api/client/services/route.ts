// File Path: src\app\api\services\route.ts

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


export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { name, price, duration_minutes } = body;

    // اعتبارسنجی‌ها (همان قبلی)
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "نام خدمت الزامی است" }, { status: 400 });
    }

    const existing = await query(
      "SELECT id FROM user_services WHERE user_id = ? AND name = ?",
      [userId, name.trim()]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ success: false, message: "این خدمت قبلاً ثبت شده است" }, { status: 400 });
    }

    const safePrice = price != null ? parseFloat(price) : 0.00;
    const safeDuration = duration_minutes != null ? parseInt(duration_minutes) : 30;

    if (isNaN(safePrice) || isNaN(safeDuration)) {
      return NextResponse.json({ success: false, message: "قیمت یا مدت زمان نامعتبر" }, { status: 400 });
    }

    // INSERT بدون انتظار insertId در مرحله اول
    await query(
      `INSERT INTO user_services 
       (user_id, name, price, duration_minutes, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [userId, name.trim(), safePrice, safeDuration]
    );

    // حالا آخرین ID ثبت‌شده توسط این کاربر را بگیریم
    const [lastInsert] = await query(
      `SELECT id FROM user_services 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [userId]
    );

    const insertId = lastInsert?.id;

    if (!insertId) {
      throw new Error("سرویس ثبت شد اما ID یافت نشد");
    }

    // دریافت سرویس جدید
    const [newService] = await query(
      "SELECT id, name, price, duration_minutes, is_active FROM user_services WHERE id = ?",
      [insertId]
    );

    return NextResponse.json({
      success: true,
      message: "خدمت با موفقیت اضافه شد",
      service: newService
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error in POST service:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "خطا در ایجاد خدمت: " + (error.message || "خطای ناشناخته") 
      },
      { status: 500 }
    );
  }
});