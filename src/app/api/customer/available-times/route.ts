// src/app/api/customer/available-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentDateTime } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const targetDate = searchParams.get("date");

  if (!token || !targetDate) {
    return NextResponse.json(
      { success: false, message: "توکن یا تاریخ ارسال نشده" },
      { status: 400 },
    );
  }

  try {
    // 1. دریافت اطلاعات نوبت اصلی
    const bookingData: any[] = await query(
      `SELECT 
          b.id, 
          b.user_id, 
          b.duration_minutes, 
          b.change_count,
          b.staff_id,
          u.work_shifts, 
          u.off_days,
          s.calendar_type
       FROM booking b
       INNER JOIN users u ON b.user_id = u.id
       LEFT JOIN staffs s ON b.staff_id = s.id
       WHERE b.customer_token = ?
         AND b.token_expires_at > NOW()
         AND b.status = 'active'
       LIMIT 1`,
      [token],
    );

    if (bookingData.length === 0) {
      return NextResponse.json(
        { success: false, message: "نوبت معتبر یافت نشد" },
        { status: 403 },
      );
    }

    const booking = bookingData[0];
    const userId = booking.user_id;
    const staffId = booking.staff_id;
    const calendarType = booking.calendar_type;
    const duration = booking.duration_minutes || 30;

    if (booking.change_count >= 1) {
      return NextResponse.json(
        { success: false, message: "تعداد تغییرات مجاز به پایان رسیده" },
        { status: 403 },
      );
    }

    // بررسی روز تعطیل
    const selectedDateObj = new Date(targetDate);
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1;
    const offDays: number[] = booking.off_days
      ? JSON.parse(booking.off_days)
      : [];

    if (offDays.includes(dayIndex)) {
      return NextResponse.json({
        success: true,
        availableTimes: [],
        bookedTimes: [],
        workShifts: [],
        message: "تعطیل",
      });
    }

    // پردازش شیفت‌های کاری از تنظیمات کاربر (داینامیک)
    let rawWorkShifts: any[] = [];
    try {
      rawWorkShifts = booking.work_shifts
        ? JSON.parse(booking.work_shifts)
        : [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }];
    } catch (e) {
      rawWorkShifts = [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }];
    }

    // اضافه کردن name به شیفت‌ها بر اساس زمان شروع
    const workShifts = rawWorkShifts.map((shift: { start: string; end: string }) => {
      const startHour = parseInt(shift.start.split(":")[0]);
      let name = "شیفت کاری";
      
      if (startHour >= 0 && startHour < 12) {
        name = "شیفت صبح";
      } else if (startHour >= 12 && startHour < 16) {
        name = "شیفت ظهر";
      } else if (startHour >= 16 && startHour < 20) {
        name = "شیفت عصر";
      } else if (startHour >= 20) {
        name = "شیفت شب";
      }
      
      return {
        start: shift.start,
        end: shift.end,
        name: name
      };
    });

    const timeToMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (minutes: number): string => {
      const h = Math.floor(minutes / 60).toString().padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    // ========== دریافت نوبت‌های رزرو شده ==========
    let bookingRecords: any[] = [];

    if (staffId && calendarType === "independent") {
      bookingRecords = await query(
        `SELECT id, client_name, booking_time, 
                COALESCE(duration_minutes, 30) AS duration_minutes
         FROM booking
         WHERE user_id = ? AND staff_id = ? AND booking_date = ? AND status = 'active' AND id != ?
         ORDER BY booking_time`,
        [userId, staffId, targetDate, booking.id],
      );
    } else if (staffId) {
      bookingRecords = await query(
        `SELECT id, client_name, booking_time, 
                COALESCE(duration_minutes, 30) AS duration_minutes
         FROM booking
         WHERE user_id = ? AND booking_date = ? AND status = 'active' AND id != ?
           AND (staff_id IS NULL OR staff_id = ?)
         ORDER BY booking_time`,
        [userId, targetDate, booking.id, staffId],
      );
    } else {
      bookingRecords = await query(
        `SELECT b.id, b.client_name, b.booking_time, 
                COALESCE(b.duration_minutes, 30) AS duration_minutes
         FROM booking b
         LEFT JOIN staffs s ON b.staff_id = s.id AND s.owner_user_id = b.user_id
         WHERE b.user_id = ? 
           AND b.booking_date = ? 
           AND b.status = 'active'
           AND b.id != ?
           AND (
             b.staff_id IS NULL
             OR (b.staff_id IS NOT NULL AND s.calendar_type = 'synced')
           )
         ORDER BY b.booking_time`,
        [userId, targetDate, booking.id],
      );
    }

    // ========== تولید زمان‌های خالی با قوانین 60 دقیقه قبل و بعد ==========
    const currentDateTime = getCurrentDateTime();
    const isToday = targetDate === currentDateTime.currentGregorianDate;
    const availableTimes: string[] = [];
    const bookedTimes: { time: string; clientName: string; startTime: string; endTime: string; duration: number }[] = [];
    const stepMinutes = duration;

    // برای هر شیفت کاری
    for (const shift of workShifts) {
      const shiftStartMin = timeToMinutes(shift.start);
      const shiftEndMin = timeToMinutes(shift.end);

      let currentSlotStart = shiftStartMin;
      let bookingIndex = 0;

      while (currentSlotStart + stepMinutes <= shiftEndMin) {
        const slotEnd = currentSlotStart + stepMinutes;
        const slotTimeString = minutesToTime(currentSlotStart);

        // فیلتر زمان گذشته (اگر امروز است)
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

        while (bookingIndex < bookingRecords.length) {
          const bookingRec = bookingRecords[bookingIndex];
          const bookingStart = timeToMinutes(bookingRec.booking_time);
          const bookingEnd = bookingStart + bookingRec.duration_minutes;

          if (bookingEnd <= currentSlotStart) {
            bookingIndex++;
            continue;
          }

          if (bookingStart >= slotEnd) {
            break;
          }

          if (currentSlotStart < bookingEnd && slotEnd > bookingStart) {
            hasConflict = true;
            conflictingBooking = bookingRec;
            
            // محاسبه محدوده مسدود شده 60 دقیقه قبل و بعد
            const blockedStart = Math.max(shiftStartMin, bookingStart - 60);
            const blockedEnd = Math.min(shiftEndMin, bookingEnd + 60);
            
            currentSlotStart = blockedEnd;
            break;
          }
        }

        if (hasConflict && conflictingBooking) {
          bookedTimes.push({
            time: conflictingBooking.booking_time,
            clientName: conflictingBooking.client_name,
            startTime: conflictingBooking.booking_time,
            endTime: minutesToTime(timeToMinutes(conflictingBooking.booking_time) + conflictingBooking.duration_minutes),
            duration: conflictingBooking.duration_minutes,
          });
          continue;
        } else {
          availableTimes.push(slotTimeString);
          currentSlotStart += stepMinutes;
        }
      }
    }

    // حذف تکراری‌ها و مرتب‌سازی
    const uniqueAvailableTimes = [...new Set(availableTimes)];
    uniqueAvailableTimes.sort();
    
    const uniqueBookedTimes = bookedTimes.filter((v, i, a) => 
      a.findIndex(t => t.time === v.time) === i
    );
    uniqueBookedTimes.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      success: true,
      availableTimes: uniqueAvailableTimes,
      bookedTimes: uniqueBookedTimes.map(bt => ({ 
        time: bt.time, 
        clientName: bt.clientName,
        startTime: bt.startTime,
        endTime: bt.endTime,
        duration: bt.duration
      })),
      workShifts: workShifts, // حالا workShifts حتماً name دارد
      isToday,
      currentTime: currentDateTime.currentTimeString,
    });
  } catch (error: any) {
    console.error("[customer/available-times] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطای سرور" },
      { status: 500 },
    );
  }
}