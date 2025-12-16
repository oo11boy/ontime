// File Path: src\app\api\services\[id]\route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// PUT - ویرایش سرویس
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authHandler = withAuth(async (req: NextRequest, authContext) => {
    const { userId } = authContext;
    const params = await context.params;
    const id = params.id;
    
    try {
      const { name, price, duration_minutes } = await req.json();

      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "نام خدمت الزامی است" },
          { status: 400 }
        );
      }

      // بررسی مالکیت سرویس
      const [service]: any = await query(
        "SELECT id FROM user_services WHERE id = ? AND user_id = ?",
        [parseInt(id), userId]
      );

      if (!service) {
        return NextResponse.json(
          { success: false, message: "خدمت یافت نشد یا دسترسی ندارید" },
          { status: 404 }
        );
      }

      // بررسی تکراری نبودن نام سرویس
      const existing = await query(
        "SELECT id FROM user_services WHERE user_id = ? AND name = ? AND id != ?",
        [userId, name.trim(), parseInt(id)]
      );

      if (existing && Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: "این نام قبلاً استفاده شده است" },
          { status: 400 }
        );
      }

      await query(
        "UPDATE user_services SET name = ?, price = ?, duration_minutes = ? WHERE id = ? AND user_id = ?",
        [
          name.trim(), 
          price ? parseFloat(price) : 0, 
          duration_minutes ? parseInt(duration_minutes) : 30, 
          parseInt(id), 
          userId
        ]
      );

      // دریافت سرویس به‌روز شده
      const [updatedService]: any = await query(
        "SELECT id, name, price, duration_minutes, is_active FROM user_services WHERE id = ?",
        [parseInt(id)]
      );

      return NextResponse.json({
        success: true,
        message: "خدمت با موفقیت ویرایش شد",
        service: updatedService
      });
    } catch (error: any) {
      console.error("Error updating service:", error);
      return NextResponse.json(
        { success: false, message: "خطا در ویرایش خدمت" },
        { status: 500 }
      );
    }
  });

  return authHandler(req, context);
}

// DELETE - حذف سرویس
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authHandler = withAuth(async (req: NextRequest, authContext) => {
    const { userId } = authContext;
    const params = await context.params;
    const id = params.id;

    try {
      // بررسی مالکیت سرویس
      const [service]: any = await query(
        "SELECT id FROM user_services WHERE id = ? AND user_id = ?",
        [parseInt(id), userId]
      );

      if (!service) {
        return NextResponse.json(
          { success: false, message: "خدمت یافت نشد یا دسترسی ندارید" },
          { status: 404 }
        );
      }

      // بررسی استفاده در booking
      const [bookings]: any = await query(
        "SELECT id FROM booking WHERE user_id = ? AND services LIKE ?",
        [userId, `%${id}%`] // تغییر: از parseInt استفاده نکن چون services رشته است
      );

      if (bookings && bookings.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "این خدمت در نوبت‌ها استفاده شده است و قابل حذف نیست" 
          },
          { status: 400 }
        );
      }

      // حذف سرویس
      await query(
        "DELETE FROM user_services WHERE id = ? AND user_id = ?",
        [parseInt(id), userId]
      );

      return NextResponse.json({
        success: true,
        message: "خدمت با موفقیت حذف شد"
      });
    } catch (error: any) {
      console.error("Error deleting service:", error);
      return NextResponse.json(
        { success: false, message: "خطا در حذف خدمت" },
        { status: 500 }
      );
    }
  });

  return authHandler(req, context);
}

// PATCH - تغییر وضعیت سرویس
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authHandler = withAuth(async (req: NextRequest, authContext) => {
    const { userId } = authContext;
    const params = await context.params;
    const id = params.id;

    try {
      const { is_active } = await req.json();

      // بررسی مالکیت سرویس
      const [service]: any = await query(
        "SELECT id FROM user_services WHERE id = ? AND user_id = ?",
        [parseInt(id), userId]
      );

      if (!service) {
        return NextResponse.json(
          { success: false, message: "خدمت یافت نشد یا دسترسی ندارید" },
          { status: 404 }
        );
      }

      await query(
        "UPDATE user_services SET is_active = ? WHERE id = ? AND user_id = ?",
        [is_active ? 1 : 0, parseInt(id), userId]
      );

      return NextResponse.json({
        success: true,
        message: `خدمت ${is_active ? 'فعال' : 'غیرفعال'} شد`
      });
    } catch (error: any) {
      console.error("Error toggling service:", error);
      return NextResponse.json(
        { success: false, message: "خطا در تغییر وضعیت خدمت" },
        { status: 500 }
      );
    }
  });

  return authHandler(req, context);
}