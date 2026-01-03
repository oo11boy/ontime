import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { getCurrentDateTime, gregorianToPersian } from "@/lib/date-utils";

const handler = withAuth(async (req: Request, { userId }) => {
  if (req.method !== "GET") {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const durationStr = url.searchParams.get("duration") || "30";
  const duration = parseInt(durationStr, 10);

  if (!date || isNaN(new Date(date).getTime())) {
    return NextResponse.json(
      { success: false, message: "تاریخ نامعتبر" },
      { status: 400 }
    );
  }

  try {
    // ۱. دریافت اطلاعات تنظیمات کاربر (شیفت‌ها و روزهای تعطیل)
    const userData: any[] = await query(
      `SELECT work_shifts, off_days FROM users WHERE id = ?`,
      [userId]
    );

    const userSettings = userData[0] || {};
    const offDays: number[] = userSettings.off_days
      ? JSON.parse(userSettings.off_days)
      : [];
    const workShifts: { start: string; end: string }[] =
      userSettings.work_shifts
        ? JSON.parse(userSettings.work_shifts)
        : [{ start: "08:00", end: "23:00" }]; // حالت پیش‌فرض

    // ۲. بررسی اینکه آیا تاریخ انتخابی جزو روزهای تعطیل کاربر هست یا خیر
    const selectedDateObj = new Date(date);
    const jalaliDate = gregorianToPersian(selectedDateObj);

    // در سیستم ما: شنبه=0، یکشنبه=1، ... جمعه=6
    // متد getDay جاوااسکریپت: یکشنبه=0، دوشنبه=1...شنبه=6. پس باید تبدیل کنیم:
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1; // تبدیل به شنبه=0

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

    // ۴. دریافت رزروهای فعال
    const bookings: any[] = await query(
      `SELECT id, client_name, booking_time, 
              COALESCE(duration_minutes, 30) AS duration_minutes, 
              status, services
       FROM booking
       WHERE user_id = ? AND booking_date = ? AND status = 'active'
       ORDER BY booking_time`,
      [userId, date]
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

    const occupiedIntervals = bookings.map((b) => ({
      start: timeToMinutes(b.booking_time),
      end: timeToMinutes(b.booking_time) + b.duration_minutes,
      booking: b,
    }));

    // ۵. ایجاد بازه‌های ممکن بر اساس شیفت‌های کاری کاربر
    const possibleSlots: number[] = [];
    workShifts.forEach((shift) => {
      const startMin = timeToMinutes(shift.start);
      const endMin = timeToMinutes(shift.end);

      // ایجاد اسلات‌های ۳۰ دقیقه‌ای در بازه هر شیفت
      for (let m = startMin; m < endMin; m += 30) {
        possibleSlots.push(m);
      }
    });

    const availableTimes: string[] = [];
    const bookedTimes: any[] = [];

    // ۶. فیلتر کردن اسلات‌ها
    for (const slotStart of possibleSlots) {
      const slotEnd = slotStart + duration;
      const slotTimeString = minutesToTime(slotStart);

      // الف) فیلتر زمان‌های گذشته (اگر امروز است)
      if (isToday) {
        const currentTotalMinutes = timeToMinutes(
          currentDateTime.currentTimeString
        );
        if (slotStart <= currentTotalMinutes) continue;
      }

      // ب) بررسی تداخل با رزروها
      let isOccupied = false;
      let overlappingBooking = null;

      for (const occ of occupiedIntervals) {
        if (slotStart < occ.end && slotEnd > occ.start) {
          isOccupied = true;
          overlappingBooking = occ.booking;
          break;
        }
      }

      if (isOccupied && overlappingBooking) {
        bookedTimes.push({
          time: slotTimeString,
          clientName: overlappingBooking.client_name,
          startTime: overlappingBooking.booking_time,
          endTime: minutesToTime(
            timeToMinutes(overlappingBooking.booking_time) +
              overlappingBooking.duration_minutes
          ),
          services: overlappingBooking.services,
        });
      } else {
        // ج) بررسی اینکه نوبت در انتهای شیفت از ساعت پایان شیفت فراتر نرود
        const currentShift = workShifts.find(
          (s) =>
            slotStart >= timeToMinutes(s.start) &&
            slotStart < timeToMinutes(s.end)
        );
        if (currentShift && slotEnd <= timeToMinutes(currentShift.end)) {
          availableTimes.push(slotTimeString);
        }
      }
    }

    return NextResponse.json({
      success: true,
      availableTimes,
      bookedTimes,
      isToday,
    });
  } catch (error) {
    console.error("[available-times] Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
});

export { handler as GET };
