// src/app/api/customer-link/[slug]/available-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentDateTime } from "@/lib/date-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get("date");

  if (!slug || !targetDate) {
    return NextResponse.json(
      { success: false, message: "slug یا تاریخ ارسال نشده" },
      { status: 400 }
    );
  }

  try {
    // 1. دریافت اطلاعات لینک و کسب‌وکار
    const linkData: any[] = await query(
      `SELECT 
        cl.user_id,
        cl.slug,
        u.work_shifts,
        u.off_days,
        u.business_name
       FROM customer_links cl
       INNER JOIN users u ON cl.user_id = u.id
       WHERE cl.slug = ? AND cl.is_active = 1`,
      [slug]
    );

    if (linkData.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک معتبر نیست" },
        { status: 404 }
      );
    }

    const business = linkData[0];
    const userId = business.user_id;

    // ========== بررسی روزهای تعطیل ==========
    let offDays: number[] = [];
    try {
      offDays = business.off_days ? JSON.parse(business.off_days) : [];
    } catch (e) {
      offDays = [];
    }

    const selectedDateObj = new Date(targetDate);
    const jsDay = selectedDateObj.getDay();
    // تبدیل به شمسی: 0=شنبه, 1=یکشنبه, ..., 6=جمعه
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1;

    if (offDays.includes(dayIndex)) {
      return NextResponse.json({
        success: true,
        availableTimes: [],
        bookedTimes: [],
        workShifts: [],
        message: "تعطیل",
        isToday: targetDate === getCurrentDateTime().currentGregorianDate,
        currentTime: getCurrentDateTime().currentTimeString,
      });
    }

    // ========== پردازش شیفت‌های کاری ==========
    let rawWorkShifts: any[] = [];
    try {
      rawWorkShifts = business.work_shifts
        ? JSON.parse(business.work_shifts)
        : [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }];
    } catch (e) {
      rawWorkShifts = [{ start: "09:00", end: "13:00" }, { start: "16:00", end: "20:00" }];
    }

    // اضافه کردن name به شیفت‌ها
    const workShifts = rawWorkShifts.map((shift: { start: string; end: string }) => {
      const startHour = parseInt(shift.start.split(":")[0]);
      const endHour = parseInt(shift.end.split(":")[0]);
      const duration = endHour - startHour;
      
      let name = "شیفت کاری";
      
      // اگر شیفت طولانی است (بیش از 6 ساعت)
      if (duration > 6) {
        if (startHour >= 6 && startHour <= 10) {
          name = "شیفت کامل (صبح تا عصر)";
        } else if (startHour >= 10 && startHour <= 14) {
          name = "شیفت کامل (ظهر تا شب)";
        } else {
          name = "شیفت تمام‌وقت";
        }
      } else {
        // شیفت‌های کوتاه
        if (startHour >= 0 && startHour < 12) {
          name = "شیفت صبح";
        } else if (startHour >= 12 && startHour < 16) {
          name = "شیفت ظهر";
        } else if (startHour >= 16 && startHour < 20) {
          name = "شیفت عصر";
        } else if (startHour >= 20) {
          name = "شیفت شب";
        }
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
    // نوبت‌های فعال (active و pending) برای این تاریخ
    const bookingRecords: any[] = await query(
      `SELECT 
        b.id, 
        b.client_name, 
        b.booking_time, 
        COALESCE(b.duration_minutes, 30) AS duration_minutes,
        b.status
       FROM booking b
       WHERE b.user_id = ? 
         AND b.booking_date = ? 
         AND b.status IN ('active', 'pending')
       ORDER BY b.booking_time`,
      [userId, targetDate]
    );

    // ========== تولید زمان‌های خالی ==========
    const currentDateTime = getCurrentDateTime();
    const isToday = targetDate === currentDateTime.currentGregorianDate;
    const availableTimes: string[] = [];
    const bookedTimes: { 
      time: string; 
      clientName: string; 
      startTime: string; 
      endTime: string; 
      duration: number;
      status: string;
    }[] = [];
    
    const stepMinutes = 30; // گام زمانی 30 دقیقه

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
            status: conflictingBooking.status,
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
      bookedTimes: uniqueBookedTimes,
      workShifts: workShifts,
      isToday,
      currentTime: currentDateTime.currentTimeString,
    });
  } catch (error: any) {
    console.error("[customer-link/available-times] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
}