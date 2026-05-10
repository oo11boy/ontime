// File Path: src/app/api/client/services/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// دریافت لیست سرویس‌های کاربر (با پشتیبانی از پرسنل)
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // دریافت اطلاعات پرسنل از کوکی
    const cookieStore = await cookies();
    const userType = cookieStore.get("user_type")?.value;
    const staffId = cookieStore.get("staff_id")?.value;

    let services: unknown[] = [];

    if (userType === "staff" && staffId) {
      // ========== حالت پرسنل: فقط خدماتی که برایش تعیین شده ==========
      // دریافت service_ids پرسنل
      const staff = await query<any>(
        "SELECT service_ids FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [staffId, userId]
      );

      if (staff && staff.length > 0 && staff[0].service_ids) {
        const serviceIds = staff[0].service_ids.split(",").filter((id: string) => id.trim());
        
        if (serviceIds.length > 0) {
          const placeholders = serviceIds.map(() => "?").join(",");
          services = await query(
            `SELECT id, name, price, duration_minutes, is_active, created_at 
             FROM user_services 
             WHERE user_id = ? AND id IN (${placeholders}) AND is_active = 1
             ORDER BY created_at DESC`,
            [userId, ...serviceIds]
          );
        } else {
          services = [];
        }
      } else {
        services = [];
      }
    } else {
      // ========== حالت کاربر عادی (رییس): همه خدمات ==========
      services = await query(
        "SELECT id, name, price, duration_minutes, is_active, created_at FROM user_services WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
    }

    return NextResponse.json({
      success: true,
      services: services || [],
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
    // بررسی: پرسنل نمی‌تواند سرویس ایجاد کند
    const cookieStore = await cookies();
    const userType = cookieStore.get("user_type")?.value;
    
    if (userType === "staff") {
      return NextResponse.json(
        { success: false, message: "شما مجوز ایجاد سرویس جدید را ندارید" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, price, duration_minutes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "نام خدمت الزامی است" },
        { status: 400 }
      );
    }

    const existing = await query(
      "SELECT id FROM user_services WHERE user_id = ? AND name = ?",
      [userId, name.trim()]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "این خدمت قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const safePrice = price != null ? parseFloat(price) : 0.0;
    const safeDuration = duration_minutes != null ? parseInt(duration_minutes) : 30;

    if (isNaN(safePrice) || isNaN(safeDuration)) {
      return NextResponse.json(
        { success: false, message: "قیمت یا مدت زمان نامعتبر" },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO user_services 
       (user_id, name, price, duration_minutes, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [userId, name.trim(), safePrice, safeDuration]
    );

    const [lastInsert] = await query<{ id: number }>(
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

    const [newService] = await query(
      "SELECT id, name, price, duration_minutes, is_active FROM user_services WHERE id = ?",
      [insertId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "خدمت با موفقیت اضافه شد",
        service: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "خطا در ایجاد خدمت: " + (error.message || "خطای ناشناخته"),
      },
      { status: 500 }
    );
  }
});