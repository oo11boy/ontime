import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { formatPersianDate } from "@/lib/date-utils";

interface CustomerBooking {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  booking_description: string | null;
  services: string | null;
  status: "active" | "cancelled" | "done";
  change_count: number;
  customer_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  business_name?: string;
  business_phone?: string;
  business_address?: string;
  off_days?: string; // روزهای تعطیل به صورت استرینگ ذخیره شده در دیتابیس
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "توکن الزامی است" },
      { status: 400 }
    );
  }

  try {
    const bookings = await query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') AS booking_time,
        b.duration_minutes,
        b.booking_description,
        b.services,
        b.status,
        b.change_count,
        b.customer_token,
        b.token_expires_at,
        b.created_at,
        u.business_name,
        u.phone AS business_phone,
        u.business_address,
        u.off_days
      FROM booking b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.customer_token = ?
        AND b.token_expires_at > NOW()
        AND b.status IN ('active', 'done', 'cancelled')`,
      [token]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "نوبت یافت نشد یا منقضی شده" },
        { status: 404 }
      );
    }

    const booking = bookings[0] as CustomerBooking;

    // تبدیل روزهای تعطیل از رشته به آرایه اعداد
const offDaysArray = booking.off_days 
  ? JSON.parse(booking.off_days) 
  : [];

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        date: booking.booking_date,
        time: booking.booking_time,
        duration: booking.duration_minutes,
        description: booking.booking_description || "",
        services: booking.services ? booking.services.split(", ") : [],
        status: booking.status,
        changeCount: booking.change_count,
        token: booking.customer_token,
        expiresAt: booking.token_expires_at,
        createdAt: booking.created_at,
        businessName: booking.business_name || "نام کسب‌وکار ثبت نشده",
        businessPhone: booking.business_phone || "",
        businessAddress: booking.business_address || "",
        canCancel: booking.status === "active",
        canReschedule: booking.status === "active" && booking.change_count < 1,
        offDays: offDaysArray
      },
    });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات نوبت:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action, data } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "توکن الزامی است" },
        { status: 400 }
      );
    }

    const bookings = await query(
      `SELECT 
        b.id,
        b.status,
        b.change_count,
        b.user_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') AS booking_time
      FROM booking b
      WHERE b.customer_token = ?
        AND b.token_expires_at > NOW()
        AND b.status IN ('active', 'done')`,
      [token]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر یا منقضی شده" },
        { status: 404 }
      );
    }

    const booking = bookings[0] as any;
    const persianDate = formatPersianDate(booking.booking_date);
    const timeDisplay = booking.booking_time;

    if (action === "cancel") {
      if (booking.status !== "active") {
        return NextResponse.json(
          { success: false, message: "این نوبت قابل لغو نیست" },
          { status: 400 }
        );
      }

      await query(
        `UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [booking.id]
      );

      // ثبت در گزارش پیامک (در صورت نیاز به ارسال واقعی، باید وب‌سرویس فراخوانی شود)
      await query(
        `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at)
         VALUES (?, ?, ?, 'cancellation', 'sent', NOW())`,
        [
          booking.user_id,
          booking.client_phone,
          `نوبت شما لغو شد. تاریخ: ${persianDate} - زمان: ${timeDisplay}`,
        ]
      );

      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          booking.user_id,
          booking.id,
          `مشتری (${booking.client_name}) نوبت خود را برای تاریخ ${persianDate} ساعت ${timeDisplay} لغو کرد.`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    }

    if (action === "reschedule") {
      if (booking.status !== "active") {
        return NextResponse.json(
          { success: false, message: "این نوبت قابل تغییر نیست" },
          { status: 400 }
        );
      }

      if (booking.change_count >= 1) {
        return NextResponse.json(
          { success: false, message: "تعداد مجاز تغییرات (۱ بار) تمام شده است" },
          { status: 400 }
        );
      }

      const { newDate, newTime } = data;
      if (!newDate || !newTime) {
        return NextResponse.json(
          { success: false, message: "تاریخ و زمان جدید الزامی است" },
          { status: 400 }
        );
      }

      const newPersianDate = formatPersianDate(newDate);

      // بررسی تداخل (مجدداً در سمت سرور)
      const conflicts = await query(
        `SELECT id FROM booking 
         WHERE user_id = ? AND booking_date = ? AND booking_time = ? AND status = 'active' AND id != ?`,
        [booking.user_id, newDate, newTime, booking.id]
      );

      if (conflicts.length > 0) {
        return NextResponse.json(
          { success: false, message: "متأسفانه این زمان در همین لحظه رزرو شد" },
          { status: 400 }
        );
      }

      await query(
        `UPDATE booking 
         SET booking_date = ?, booking_time = ?, change_count = change_count + 1, updated_at = NOW()
         WHERE id = ?`,
        [newDate, newTime, booking.id]
      );

      await query(
        `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at)
         VALUES (?, ?, ?, 'reschedule', 'sent', NOW())`,
        [
          booking.user_id,
          booking.client_phone,
          `زمان نوبت شما تغییر کرد. تاریخ جدید: ${newPersianDate} - زمان جدید: ${newTime}`,
        ]
      );

      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'reschedule', ?, NOW())`,
        [
          booking.user_id,
          booking.id,
          `مشتری (${booking.client_name}) زمان نوبت خود را به ${newPersianDate} ساعت ${newTime} تغییر داد.`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "زمان نوبت با موفقیت تغییر یافت",
      });
    }

    return NextResponse.json(
      { success: false, message: "عملیات نامعتبر" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("خطا در پردازش درخواست:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
}