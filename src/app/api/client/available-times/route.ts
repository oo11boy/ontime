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
  const requestedStaffId = url.searchParams.get("staffId");

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

    // ۲. بررسی اینکه آیا تاریخ انتخابی جزو روزهای تعطیل کاربر هست یا خیر
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
    let occupiedIntervals: { start: number; end: number; booking: any }[] = [];
    let bookingRecords: any[] = [];

    // ========== مورد 1: کاربر از نوع پرسنل است ==========
    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId],
      );
      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        // تقویم مستقل: فقط نوبت‌های خود پرسنل
        bookingRecords = await query(
          `SELECT id, client_name, booking_time, 
                  COALESCE(duration_minutes, 30) AS duration_minutes, 
                  status, services
           FROM booking
           WHERE user_id = ? AND staff_id = ? AND booking_date = ? AND status = 'active'
           ORDER BY booking_time`,
          [userId, parseInt(staffId), date],
        );
      } else {
        // تقویم هماهنگ (synced): نوبت‌های رییس (staff_id IS NULL) + نوبت‌های خود پرسنل
        bookingRecords = await query(
          `SELECT id, client_name, booking_time, 
                  COALESCE(duration_minutes, 30) AS duration_minutes, 
                  status, services
           FROM booking
           WHERE user_id = ? AND booking_date = ? AND status = 'active'
             AND (staff_id IS NULL OR staff_id = ?)
           ORDER BY booking_time`,
          [userId, date, parseInt(staffId)],
        );
      }
    } 
    // ========== مورد 2: کاربر از نوع رییس است ==========
    else {
      // رییس فقط نوبت‌های خودش را می‌بیند (staff_id IS NULL)
      // و نوبت‌های پرسنل با تقویم مستقل را نباید ببیند
      bookingRecords = await query(
        `SELECT b.id, b.client_name, b.booking_time, 
                COALESCE(b.duration_minutes, 30) AS duration_minutes, 
                b.status, b.services
         FROM booking b
         LEFT JOIN staffs s ON b.staff_id = s.id AND s.owner_user_id = b.user_id
         WHERE b.user_id = ? 
           AND b.booking_date = ? 
           AND b.status = 'active'
           AND (
             -- نوبت‌های خود رییس
             b.staff_id IS NULL
             -- یا نوبت‌های پرسنل با تقویم هماهنگ (synced)
             OR (b.staff_id IS NOT NULL AND s.calendar_type = 'synced')
           )
         ORDER BY b.booking_time`,
        [userId, date],
      );
    }

    // ساخت بازه‌های مسدود شده
    for (const booking of bookingRecords) {
      occupiedIntervals.push({
        start: timeToMinutes(booking.booking_time),
        end: timeToMinutes(booking.booking_time) + booking.duration_minutes,
        booking: booking,
      });
    }

    // ۵. ایجاد بازه‌های ممکن بر اساس شیفت‌های کاری کاربر
    const possibleSlots: number[] = [];
    workShifts.forEach((shift) => {
      const startMin = timeToMinutes(shift.start);
      const endMin = timeToMinutes(shift.end);

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
          currentDateTime.currentTimeString,
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
              overlappingBooking.duration_minutes,
          ),
          services: overlappingBooking.services,
        });
      } else {
        // ج) بررسی اینکه نوبت در انتهای شیفت از ساعت پایان شیفت فراتر نرود
        const currentShift = workShifts.find(
          (s) =>
            slotStart >= timeToMinutes(s.start) &&
            slotStart < timeToMinutes(s.end),
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
      { status: 500 },
    );
  }
});

export { handler as GET };