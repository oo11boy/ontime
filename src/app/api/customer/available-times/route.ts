// src/app/api/customer/available-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentDateTime, gregorianToPersian } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const targetDate = searchParams.get("date"); // فرمت YYYY-MM-DD

  if (!token || !targetDate) {
    return NextResponse.json(
      { success: false, message: "توکن یا تاریخ ارسال نشده" },
      { status: 400 }
    );
  }

  try {
    // ۱. دریافت اطلاعات نوبت مشتری و تنظیمات کاربر (آرایشگر)
    const bookingData: any[] = await query(
      `SELECT 
          b.id, b.user_id, b.duration_minutes, b.change_count,
          u.work_shifts, u.off_days
       FROM booking b
       INNER JOIN users u ON b.user_id = u.id
       WHERE b.customer_token = ?
         AND b.token_expires_at > NOW()
         AND b.status = 'active'
       LIMIT 1`,
      [token]
    );

    if (bookingData.length === 0) {
      return NextResponse.json(
        { success: false, message: "نوبت معتبر یافت نشد" },
        { status: 403 }
      );
    }

    const booking = bookingData[0];
    const userId = booking.user_id;
    const duration = booking.duration_minutes || 30;

    // ۲. بررسی سقف تغییرات
    if (booking.change_count >= 1) {
      return NextResponse.json(
        { success: false, message: "تعداد تغییرات مجاز به پایان رسیده" },
        { status: 403 }
      );
    }

    // ۳. بررسی روز تعطیل (هماهنگ با متد پنل مدیریت)
    const selectedDateObj = new Date(targetDate);
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1; // تبدیل به شنبه=0

    const offDays: number[] = booking.off_days
      ? JSON.parse(booking.off_days)
      : [];
    if (offDays.includes(dayIndex)) {
      return NextResponse.json({
        success: true,
        availableTimes: [],
        message: "تعطیل",
      });
    }

    // ۴. دریافت شیفت‌های کاری
    const workShifts: { start: string; end: string }[] = booking.work_shifts
      ? JSON.parse(booking.work_shifts)
      : [{ start: "08:00", end: "23:00" }];

    // ۵. دریافت رزروهای فعال دیگران در این تاریخ
    const occupied: any[] = await query(
      `SELECT booking_time, COALESCE(duration_minutes, 30) AS duration_minutes
       FROM booking
       WHERE user_id = ? AND booking_date = ? AND status = 'active' AND id != ?`,
      [userId, targetDate, booking.id]
    );

    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes: number): string => {
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    const occupiedIntervals = occupied.map((occ) => ({
      start: timeToMinutes(occ.booking_time),
      end: timeToMinutes(occ.booking_time) + occ.duration_minutes,
    }));

    // ۶. تولید اسلات‌های زمانی بر اساس شیفت‌ها
    const currentDateTime = getCurrentDateTime();
    const isToday = targetDate === currentDateTime.currentGregorianDate;
    const availableTimes: string[] = [];

    workShifts.forEach((shift) => {
      const startMin = timeToMinutes(shift.start);
      const endMin = timeToMinutes(shift.end);

      for (let m = startMin; m < endMin; m += 30) {
        const slotStart = m;
        const slotEnd = m + duration;

        // الف) فیلتر زمان گذشته
        if (isToday) {
          const nowMin = timeToMinutes(currentDateTime.currentTimeString);
          if (slotStart <= nowMin) continue;
        }

        // ب) عدم فراتر رفتن از پایان شیفت
        if (slotEnd > endMin) continue;

        // ج) بررسی تداخل با رزروهای دیگر
        const hasConflict = occupiedIntervals.some(
          (occ) => slotStart < occ.end && slotEnd > occ.start
        );

        if (!hasConflict) {
          availableTimes.push(minutesToTime(slotStart));
        }
      }
    });

    return NextResponse.json({
      success: true,
      availableTimes,
      isToday,
    });
  } catch (error: any) {
    console.error("[customer/available-times] Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}
