// src/app/api/available-times/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { getCurrentDateTime, gregorianToPersian } from "@/lib/date-utils";
import { cookies } from "next/headers";

const handler = withAuth(async (req: Request, context: any) => {
  const { userId } = context;

  if (req.method !== "GET") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 },
    );
  }

  // دریافت نوع کاربر و staffId از کوکی
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const durationStr = url.searchParams.get("duration") || "30";
  const duration = parseInt(durationStr, 10);

  if (!date || isNaN(new Date(date).getTime())) {
    return NextResponse.json(
      { success: false, message: "تاریخ نامعتبر" },
      { status: 400 },
    );
  }

  try {
    // ۱. دریافت اطلاعات تنظیمات کاربر (شیفت‌ها و روزهای تعطیل)
    const userData: any[] = await query(
      `SELECT work_shifts, off_days FROM users WHERE id = ?`,
      [userId],
    );

    const userSettings = userData[0] || {};
    const offDays: number[] = userSettings.off_days
      ? JSON.parse(userSettings.off_days)
      : [];
    const workShifts: { start: string; end: string }[] =
      userSettings.work_shifts
        ? JSON.parse(userSettings.work_shifts)
        : [{ start: "08:00", end: "23:00" }];

    // ۲. بررسی روز تعطیل
    const selectedDateObj = new Date(date);
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1;

    if (offDays.includes(dayIndex)) {
      return NextResponse.json({
        success: true,
        availableTimes: [],
        bookedTimes: [],
        message: "امروز روز تعطیل کسب‌وکار است.",
      });
    }

    // ۳. گرفتن زمان فعلی و بررسی امروز بودن
    const currentDateTime = getCurrentDateTime();
    const isToday = date === currentDateTime.currentGregorianDate;

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

    // ========== منطق دریافت نوبت‌های مسدود ==========
    let bookingRecords: any[] = [];

    // دریافت نوبت‌های فعال در تاریخ مورد نظر
    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId],
      );
      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        bookingRecords = await query(
          `SELECT id, client_name, booking_time, 
                  COALESCE(duration_minutes, 30) AS duration_minutes
           FROM booking
           WHERE user_id = ? AND staff_id = ? AND booking_date = ? AND status = 'active'
           ORDER BY booking_time`,
          [userId, parseInt(staffId), date],
        );
      } else {
        bookingRecords = await query(
          `SELECT id, client_name, booking_time, 
                  COALESCE(duration_minutes, 30) AS duration_minutes
           FROM booking
           WHERE user_id = ? AND booking_date = ? AND status = 'active'
             AND (staff_id IS NULL OR staff_id = ?)
           ORDER BY booking_time`,
          [userId, date, parseInt(staffId)],
        );
      }
    } else {
      bookingRecords = await query(
        `SELECT b.id, b.client_name, b.booking_time, 
                COALESCE(b.duration_minutes, 30) AS duration_minutes
         FROM booking b
         LEFT JOIN staffs s ON b.staff_id = s.id AND s.owner_user_id = b.user_id
         WHERE b.user_id = ? 
           AND b.booking_date = ? 
           AND b.status = 'active'
           AND (
             b.staff_id IS NULL
             OR (b.staff_id IS NOT NULL AND s.calendar_type = 'synced')
           )
         ORDER BY b.booking_time`,
        [userId, date],
      );
    }

    // ========== تولید زمان‌های خالی ==========
    const availableTimes: string[] = [];
    const bookedTimes: any[] = [];
    const stepMinutes = duration; // فاصله بین اسلات‌ها = مدت زمان نوبت

    // برای هر شیفت کاری
    for (const shift of workShifts) {
      const shiftStartMin = timeToMinutes(shift.start);
      const shiftEndMin = timeToMinutes(shift.end);

      // شروع از ابتدای شیفت
      let currentSlotStart = shiftStartMin;

      while (currentSlotStart + stepMinutes <= shiftEndMin) {
        const slotEnd = currentSlotStart + stepMinutes;
        const slotTimeString = minutesToTime(currentSlotStart);

        // بررسی زمان گذشته (اگر امروز است)
        if (isToday) {
          const nowMin = timeToMinutes(currentDateTime.currentTimeString);
          if (currentSlotStart <= nowMin) {
            currentSlotStart += stepMinutes;
            continue;
          }
        }

        // بررسی تداخل با نوبت‌های رزرو شده
        let hasConflict = false;
        let conflictingBooking = null;

        for (const booking of bookingRecords) {
          const bookingStart = timeToMinutes(booking.booking_time);
          const bookingEnd = bookingStart + booking.duration_minutes;

          // اگر اسلات فعلی با نوبت رزرو شده تداخل دارد
          if (currentSlotStart < bookingEnd && slotEnd > bookingStart) {
            hasConflict = true;
            conflictingBooking = booking;

            // مهم: اگر نوبت رزرو شده طولانی است، اسلات بعدی باید بعد از پایان آن باشد
            // این کار باعث می‌شود نوبت بعدی در زمان صحیح (مثلاً 9:40 به جای 10:00) قرار گیرد
            const newStartAfterBooking = bookingEnd;
            if (newStartAfterBooking > currentSlotStart) {
              currentSlotStart = newStartAfterBooking;
            }
            break;
          }
        }

        if (hasConflict && conflictingBooking) {
          bookedTimes.push({
            time: slotTimeString,
            clientName: conflictingBooking.client_name,
            startTime: conflictingBooking.booking_time,
            endTime: minutesToTime(
              timeToMinutes(conflictingBooking.booking_time) +
                conflictingBooking.duration_minutes,
            ),
          });
          // ادامه حلقه با موقعیت جدید (currentSlotStart قبلاً به‌روز شده)
          continue;
        } else {
          // اسلات خالی است
          availableTimes.push(slotTimeString);
          currentSlotStart += stepMinutes;
        }
      }
    }

    // مرتب کردن زمان‌ها
    availableTimes.sort();
    bookedTimes.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      success: true,
      availableTimes,
      bookedTimes,
      isToday,
      duration, // برگرداندن duration برای دیباگ
    });
  } catch (error) {
    console.error("[available-times] Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 },
    );
  }
});

export { handler as GET };
