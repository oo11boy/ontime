// src/app/api/customer/available-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentDateTime } from "@/lib/date-utils";
// src/types/booking.ts
export interface CustomerBooking {
  id: number;
  user_id: number;
  duration_minutes: number | null;
  change_count: number;
  current_booking_date: string; // یا Date اگر می‌خوای
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const targetDate = searchParams.get("date"); // تاریخ هدف به فرمت YYYY-MM-DD

  if (!token || !targetDate) {
    return NextResponse.json(
      { success: false, message: "توکن یا تاریخ ارسال نشده" },
      { status: 400 }
    );
  }

  // اعتبارسنجی تاریخ
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return NextResponse.json(
      { success: false, message: "فرمت تاریخ نامعتبر" },
      { status: 400 }
    );
  }

  try {
    // ۱. اعتبارسنجی توکن مشتری و گرفتن اطلاعات نوبت
    const bookings = await query(
      `SELECT 
         b.id,
         b.user_id,
         b.duration_minutes,
         b.change_count,
         b.booking_date AS current_booking_date
       FROM booking b
       WHERE b.customer_token = ?
         AND b.token_expires_at > NOW()
         AND b.status = 'active'
       LIMIT 1`,
      [token]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر، منقضی یا نوبت لغو شده" },
        { status: 403 }
      );
    }

const booking = bookings[0] as CustomerBooking;

    // ۲. چک تعداد تغییرات مجاز (اینجا می‌تونی ۱ بار کنی)
    if (booking.change_count >= 1) { // یا >= 1 اگر فقط یک بار بخوای
      return NextResponse.json(
        { success: false, message: "تعداد تغییرات مجاز به پایان رسیده" },
        { status: 403 }
      );
    }

    const duration = booking.duration_minutes || 30;
    const userId = booking.user_id;

    // ۳. گرفتن زمان فعلی برای فیلتر زمان‌های گذشته
    const { currentGregorianDate, currentTimeString } = getCurrentDateTime();
    const isToday = targetDate === currentGregorianDate;

    // ۴. گرفتن تمام رزروهای فعال در تاریخ هدف (به جز نوبت خود مشتری)
    const occupied = await query(
      `SELECT booking_time, COALESCE(duration_minutes, 30) AS duration_minutes
       FROM booking
       WHERE user_id = ?
         AND booking_date = ?
         AND status = 'active'
         AND id != ?
       ORDER BY booking_time`,
      [userId, targetDate, booking.id]
    );

    // ۵. محاسبه زمان‌های آزاد (مشابه API سالن‌دار، اما بدون نشت اطلاعات)
    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes: number): string => {
      const h = String(Math.floor(minutes / 60)).padStart(2, "0");
      const m = String(minutes % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    const occupiedIntervals = occupied.map((b: any) => ({
      start: timeToMinutes(b.booking_time),
      end: timeToMinutes(b.booking_time) + b.duration_minutes,
    }));

    // اسلات‌های ۳۰ دقیقه‌ای از ۸ صبح تا ۲۳:۳۰
    const slots: number[] = [];
    for (let m = 8 * 60; m <= 23 * 60; m += 30) {
      slots.push(m);
    }

    const availableTimes: string[] = [];

    for (const start of slots) {
      const end = start + duration;

      // خارج از ساعات کاری
      if (end > 23 * 60 + 30) continue;

      const timeStr = minutesToTime(start);

      // زمان گذشته در امروز
      if (isToday) {
        const nowMinutes = timeToMinutes(currentTimeString);
        if (start + duration <= nowMinutes) continue; // کل بازه گذشته باشه
      }

      // تداخل با رزروهای دیگر
      const hasConflict = occupiedIntervals.some(
        (int: any) => start < int.end && end > int.start
      );

      if (!hasConflict) {
        availableTimes.push(timeStr);
      }
    }

    return NextResponse.json({
      success: true,
      availableTimes,
      // اختیاری: برای دیباگ (در پروداکشن حذف کن)
      // debug: { targetDate, duration, occupiedCount: occupied.length }
    });
  } catch (error) {
    console.error("[customer/available-times] خطا:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}