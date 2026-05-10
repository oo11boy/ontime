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
      { status: 400 }
    );
  }

  try {
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
    const staffId = booking.staff_id;
    const calendarType = booking.calendar_type;

    if (booking.change_count >= 1) {
      return NextResponse.json(
        { success: false, message: "تعداد تغییرات مجاز به پایان رسیده" },
        { status: 403 }
      );
    }

    // بررسی روز تعطیل
    const selectedDateObj = new Date(targetDate);
    const jsDay = selectedDateObj.getDay();
    const dayIndex = jsDay === 6 ? 0 : jsDay + 1;
    const offDays: number[] = booking.off_days ? JSON.parse(booking.off_days) : [];
    
    if (offDays.includes(dayIndex)) {
      return NextResponse.json({
        success: true,
        availableTimes: [],
        bookedTimes: [],
        message: "تعطیل",
      });
    }

    const workShifts: { start: string; end: string }[] = booking.work_shifts
      ? JSON.parse(booking.work_shifts)
      : [{ start: "08:00", end: "23:00" }];

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
    let occupiedRecords: any[] = [];

    if (staffId && calendarType === "independent") {
      occupiedRecords = await query(
        `SELECT booking_time, COALESCE(duration_minutes, 30) AS duration_minutes, client_name
         FROM booking
         WHERE user_id = ? AND staff_id = ? AND booking_date = ? AND status = 'active' AND id != ?`,
        [userId, staffId, targetDate, booking.id]
      );
    } else {
      let sql = `
        SELECT booking_time, COALESCE(duration_minutes, 30) AS duration_minutes, client_name
        FROM booking
        WHERE user_id = ? AND booking_date = ? AND status = 'active' AND id != ?
      `;
      let params: any[] = [userId, targetDate, booking.id];

      if (staffId) {
        sql += ` AND (staff_id IS NULL OR staff_id = ?)`;
        params.push(staffId);
      } else {
        sql += ` AND (
          staff_id IS NULL 
          OR staff_id IN (
            SELECT id FROM staffs 
            WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
          )
        )`;
        params.push(userId);
      }

      occupiedRecords = await query(sql, params);
    }

    const occupiedIntervals = occupiedRecords.map((occ) => ({
      start: timeToMinutes(occ.booking_time),
      end: timeToMinutes(occ.booking_time) + occ.duration_minutes,
      booking_time: occ.booking_time,
      client_name: occ.client_name,
    }));

    // ========== تولید زمان‌های خالی ==========
    const currentDateTime = getCurrentDateTime();
    const isToday = targetDate === currentDateTime.currentGregorianDate;
    const availableTimes: string[] = [];
    const bookedTimes: { time: string; clientName: string }[] = [];

    workShifts.forEach((shift) => {
      const startMin = timeToMinutes(shift.start);
      const endMin = timeToMinutes(shift.end);

      for (let m = startMin; m < endMin; m += 30) {
        const slotStart = m;
        const slotEnd = m + duration;
        const slotTimeString = minutesToTime(slotStart);

        if (isToday) {
          const nowMin = timeToMinutes(currentDateTime.currentTimeString);
          if (slotStart <= nowMin) continue;
        }

        if (slotEnd > endMin) continue;

        // بررسی تداخل
        const conflict = occupiedIntervals.find(
          (occ) => slotStart < occ.end && slotEnd > occ.start
        );

        if (conflict) {
          bookedTimes.push({
            time: slotTimeString,
            clientName: conflict.client_name,
          });
        } else {
          availableTimes.push(slotTimeString);
        }
      }
    });

    availableTimes.sort();
    bookedTimes.sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      success: true,
      availableTimes,
      bookedTimes,
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