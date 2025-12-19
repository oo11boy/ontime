import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { getCurrentDateTime } from "@/lib/date-utils"; // اضافه کنید

const handler = withAuth(async (req: Request, { userId }) => {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const durationStr = url.searchParams.get("duration") || "30";
  const duration = parseInt(durationStr, 10);

  console.log("==================================");
  console.log("[available-times] درخواست جدید");
  console.log("[available-times] userId از withAuth:", userId, typeof userId);
  console.log("[available-times] date:", date);
  console.log("[available-times] duration:", duration);
  console.log("==================================");

  if (!date || isNaN(new Date(date).getTime())) {
    return NextResponse.json({ success: false, message: "تاریخ نامعتبر" }, { status: 400 });
  }

  if (isNaN(duration) || duration < 1) {
    return NextResponse.json({ success: false, message: "مدت زمان نامعتبر" }, { status: 400 });
  }

  try {
    // گرفتن تاریخ و زمان فعلی
    const currentDateTime = getCurrentDateTime();
    const isToday = date === currentDateTime.currentGregorianDate;

    // دریافت رزروهای فعال برای تاریخ مورد نظر
    const bookings: any[] = await query(
      `SELECT id, client_name, client_phone, booking_time, 
              COALESCE(duration_minutes, 30) AS duration_minutes, 
              status, services
       FROM booking
       WHERE user_id = ?
         AND booking_date = ?
         AND status = 'active'
       ORDER BY booking_time`,
      [userId, date]
    );

    // تابع تبدیل زمان به دقیقه
    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes: number): string => {
      const h = Math.floor(minutes / 60).toString().padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    // ایجاد لیست بازه‌های اشغال شده
    const occupiedIntervals = bookings.map(b => ({
      start: timeToMinutes(b.booking_time),
      end: timeToMinutes(b.booking_time) + b.duration_minutes,
      booking: b
    }));

    console.log("[available-times] بازه‌های اشغال‌شده:", occupiedIntervals);

    // ایجاد همه بازه‌های ممکن از 8 صبح تا 23:30
    const possibleSlots: number[] = [];
    for (let m = 8 * 60; m <= 23 * 60; m += 30) {
      possibleSlots.push(m);
    }

    const availableTimes: string[] = [];
    const bookedTimes: any[] = [];

    // بررسی هر بازه 30 دقیقه‌ای
    for (const slotStart of possibleSlots) {
      const slotEnd = slotStart + duration;
      const slotTimeString = minutesToTime(slotStart);
      
      // 1. اگر تاریخ امروز است و زمان گذشته است، آن را نادیده بگیر
      if (isToday) {
        const currentTotalMinutes = timeToMinutes(currentDateTime.currentTimeString);
        if (slotStart <= currentTotalMinutes) {
          console.log(`[available-times] زمان گذشته نادیده گرفته شد: ${slotTimeString}`);
          continue;
        }
      }
      
      // 2. بررسی تداخل با رزروهای موجود
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
        // ذخیره اطلاعات تایم رزرو شده
        bookedTimes.push({
          time: slotTimeString,
          clientName: overlappingBooking.client_name,
          startTime: overlappingBooking.booking_time,
          endTime: minutesToTime(timeToMinutes(overlappingBooking.booking_time) + overlappingBooking.duration_minutes),
          duration: overlappingBooking.duration_minutes,
          services: overlappingBooking.services
        });
      } else if (slotEnd <= 23 * 60 + 30) { // اطمینان از اینکه بازه بعد از 23:30 نرود
        // 3. بررسی اینکه کل بازه در محدوده مجاز باشد
        const slotEndTime = minutesToTime(slotEnd);
        if (slotEndTime <= "23:59") {
          availableTimes.push(slotTimeString);
        }
      }
    }

    console.log("[available-times] زمان‌های آزاد نهایی:", availableTimes);
    console.log("[available-times] زمان‌های رزرو شده:", bookedTimes);

    return NextResponse.json({
      success: true,
      availableTimes,
      bookedTimes,
      currentTime: currentDateTime.currentTimeString,
      isToday,
      debug: {
        userId,
        date,
        duration,
        bookingsFound: bookings.length,
        bookings,
      }
    });
  } catch (error) {
    console.error("[available-times] خطا:", error);
    return NextResponse.json({ success: false, message: "خطای سرور" }, { status: 500 });
  }
});

export { handler as GET };