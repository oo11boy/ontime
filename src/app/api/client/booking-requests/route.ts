// src/app/api/client/booking-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // دریافت درخواست‌های ثبت نوبت جدید (که نیاز به تایید دارند)
    // بر اساس ساختار دیتابیس شما، فرض می‌کنیم booking با status='pending' وجود دارد
    const pendingBookings = await query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') AS booking_time,
        b.duration_minutes,
        b.services,
        b.booking_description,
        b.created_at as requested_at,
        b.status,
        b.staff_id,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone
      FROM booking b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN staffs s ON b.staff_id = s.id
      WHERE b.user_id = ? 
        AND b.status = 'pending'
        AND b.source = 'customer_link'
      ORDER BY b.created_at DESC`,
      [userId]
    );

    // تبدیل به فرمت مشابه booking_changes
    const formattedRequests = pendingBookings.map((booking: any) => ({
      id: booking.id,
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      old_date: booking.booking_date,
      old_time: booking.booking_time,
      new_date: null,
      new_time: null,
      status: "pending",
      request_type: "new_booking",
      reason: booking.booking_description || "درخواست نوبت جدید",
      admin_reason: null,
      requested_at: booking.requested_at,
      booking_id: booking.id,
      staff_id: booking.staff_id,
      staff_name: booking.staff_name,
      business_name: booking.business_name,
      business_phone: booking.business_phone,
    }));

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت درخواست‌ها" },
      { status: 500 }
    );
  }
});

// POST: تایید یا رد درخواست نوبت جدید
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { id, action, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }

    const booking = await query(
      `SELECT b.*, u.business_name, u.phone as business_phone
       FROM booking b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ? AND b.user_id = ? AND b.status = 'pending'`,
      [id, userId]
    );

    if (booking.length === 0) {
      return NextResponse.json(
        { success: false, message: "درخواست یافت نشد" },
        { status: 404 }
      );
    }

    const currentBooking = booking[0] as any;

    if (action === "approve") {
      // تایید نوبت جدید
      await query(
        `UPDATE booking 
         SET status = 'active', updated_at = NOW()
         WHERE id = ?`,
        [id]
      );

      // ارسال پیامک تایید به مشتری (می‌توانید مشابه قبل پیاده‌سازی کنید)

      return NextResponse.json({
        success: true,
        message: "نوبت جدید با موفقیت تایید شد",
      });
    } 
    else if (action === "reject") {
      // رد درخواست - حذف نوبت
      await query(
        `DELETE FROM booking WHERE id = ?`,
        [id]
      );

      return NextResponse.json({
        success: true,
        message: "درخواست نوبت رد شد",
      });
    }

    return NextResponse.json(
      { success: false, message: "عملیات نامعتبر" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing booking request:", error);
    return NextResponse.json(
      { success: false, message: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
});