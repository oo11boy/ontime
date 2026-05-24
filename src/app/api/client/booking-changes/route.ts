
// src/app/api/client/booking-changes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { formatPersianDate } from "@/lib/date-utils";

// تابع تبدیل تاریخ میلادی به شمسی
function gregorianToJalali(g_y: number, g_m: number, g_d: number): string {
  g_y = parseInt(g_y as any);
  g_m = parseInt(g_m as any);
  g_d = parseInt(g_d as any);
  let gy = g_y - 1600;
  let gm = g_m - 1;
  let gd = g_d - 1;

  let g_day_no =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);

  const g_month_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let i = 0; i < gm; ++i) {
    g_day_no += g_month_days[i];
  }

  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0))
    g_day_no++;
  g_day_no += gd;

  let j_day_no = g_day_no - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no = j_day_no % 12053;
  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  const j_month_days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let i = 0;
  let days_sum = 0;
  while (i < 11 && j_day_no >= days_sum + j_month_days[i]) {
    days_sum += j_month_days[i];
    i += 1;
  }

  let jm = i + 1;
  let jd = j_day_no - days_sum + 1;

  return `${jy}/${jm.toString().padStart(2, "0")}/${jd.toString().padStart(2, "0")}`;
}

// تابع فرمت کردن زمان (حذف ثانیه)
const formatTimeOnly = (time: string): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return time;
};

// تبدیل تاریخ میلادی به شمسی با اصلاح منطقه زمانی
const convertToPersianDate = (dateStr: string | Date): string => {
  if (!dateStr) return "";

  try {
    let year: number, month: number, day: number;

    if (dateStr instanceof Date) {
      year = dateStr.getUTCFullYear();
      month = dateStr.getUTCMonth() + 1;
      day = dateStr.getUTCDate();
    } else if (typeof dateStr === "string") {
      let cleanDate = dateStr;
      if (dateStr.includes("T")) {
        cleanDate = dateStr.split("T")[0];
      }
      if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        [year, month, day] = cleanDate.split("-").map(Number);
      } else {
        const parsedDate = new Date(cleanDate);
        year = parsedDate.getUTCFullYear();
        month = parsedDate.getUTCMonth() + 1;
        day = parsedDate.getUTCDate();
      }
    } else {
      return String(dateStr);
    }

    return gregorianToJalali(year, month, day);
  } catch (error) {
    return String(dateStr);
  }
};

// تابع ارسال پیامک نتیجه درخواست
async function sendChangeNotification(
  customerPhone: string,
  customerName: string,
  status: "approved" | "rejected",
  salonName: string,
  contactPhone: string,
  newDate: string | Date | null,
  newTime: string | null,
  req: NextRequest,
) {
  const PATTERNS = {
    APPROVED: "q40uuerggl4qodq",
    REJECTED: "eowphltmynwerv6",
  };

  const patternCode =
    status === "approved" ? PATTERNS.APPROVED : PATTERNS.REJECTED;
  const messageCount = 2;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    "https://ontimeapp.ir";

  let params: Record<string, string> = {
    salon: salonName,
  };

  if (status === "approved" && newDate && newTime) {
    const persianDate = convertToPersianDate(newDate);
    const formattedTime = formatTimeOnly(newTime);
    params.date = persianDate;
    params.time = formattedTime;
  } else if (status === "rejected") {
    params.phone = contactPhone;
  }

  try {
    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        to_phone: customerPhone,
        sms_type: "booking_change_notification",
        template_key: patternCode,
        message_count: messageCount,
        name: customerName || "کاربر گرامی",
        salon: salonName,
        date: params.date,
        time: params.time,
        phone: params.phone,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error sending change notification SMS:", error);
    return false;
  }
}

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    let allRequests: any[] = [];

    // ========== 1. دریافت درخواست‌های تغییر و لغو از booking_changes ==========
    let changesSql = `
      SELECT 
        bc.id,
        bc.booking_id,
        bc.client_name,
        bc.client_phone,
        bc.request_type,
        DATE_FORMAT(bc.old_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(bc.old_time, '%H:%i') as old_time,
        DATE_FORMAT(bc.new_date, '%Y-%m-%d') as new_date,
        TIME_FORMAT(bc.new_time, '%H:%i') as new_time,
        bc.reason,
        bc.admin_reason,
        bc.status,
        bc.requested_at,
        bc.processed_at,
        bc.staff_id,
        b.cancelled_by,
        b.cancel_reason,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone
      FROM booking_changes bc
      JOIN booking b ON bc.booking_id = b.id
      LEFT JOIN staffs s ON bc.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const changesParams: any[] = [];

    if (userType === "staff" && staffId) {
      changesSql += " AND b.staff_id = ?";
      changesParams.push(parseInt(staffId));
    } else {
      changesSql += ` AND b.user_id = ?`;
      changesParams.push(userId);
    }

    const changes = await query(changesSql, changesParams);
    allRequests.push(...changes);

    // ========== 2. دریافت درخواست‌های ثبت نوبت جدید (pending از لینک مشتری) ==========
    let newBookingsSql = `
      SELECT 
        b.id as booking_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as old_time,
        NULL as new_date,
        NULL as new_time,
        b.booking_description as reason,
        NULL as admin_reason,
        b.status,
        b.created_at as requested_at,
        NULL as processed_at,
        b.staff_id,
        NULL as cancelled_by,
        NULL as cancel_reason,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone,
        'new_booking' as request_type
      FROM booking b
      LEFT JOIN staffs s ON b.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending' 
        AND b.source = 'customer_link'
    `;

    const newBookingsParams: any[] = [];

    if (userType === "staff" && staffId) {
      newBookingsSql += " AND b.staff_id = ?";
      newBookingsParams.push(parseInt(staffId));
    } else {
      newBookingsSql += ` AND b.user_id = ?`;
      newBookingsParams.push(userId);
    }

    const newBookings = await query(newBookingsSql, newBookingsParams);

    const formattedNewBookings = newBookings.map((booking: any) => ({
      id: booking.booking_id,
      booking_id: booking.booking_id,
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      request_type: "new_booking",
      old_date: booking.old_date,
      old_time: booking.old_time,
      new_date: null,
      new_time: null,
      reason: booking.reason,
      admin_reason: null,
      status: booking.status,
      requested_at: booking.requested_at,
      processed_at: null,
      staff_id: booking.staff_id,
      staff_name: booking.staff_name,
      business_name: booking.business_name,
      business_phone: booking.business_phone,
      calendar_type: booking.calendar_type,
      staff_phone: booking.staff_phone,
      cancelled_by: null,
      service_name: booking.service_name,  // ✅ اضافه شد
      services: booking.services,          // ✅ اضافه شد
    }));

    allRequests.push(...formattedNewBookings);

    // ========== 3. اضافه کردن نوبت‌هایی که مستقیماً توسط ادمین لغو شده‌اند ==========
    let directlyCancelledSql = `
      SELECT 
        b.id as booking_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as old_time,
        NULL as new_date,
        NULL as new_time,
        b.cancel_reason as reason,
        NULL as admin_reason,
        'approved' as status,
        b.updated_at as requested_at,
        b.updated_at as processed_at,
        b.staff_id,
        b.cancelled_by,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone,
        'cancel' as request_type
      FROM booking b
      LEFT JOIN staffs s ON b.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'cancelled'
        AND b.cancelled_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM booking_changes bc 
          WHERE bc.booking_id = b.id AND bc.request_type = 'cancel'
        )
    `;
    const directlyCancelledParams: any[] = [];

    if (userType === "staff" && staffId) {
      directlyCancelledSql += " AND b.staff_id = ?";
      directlyCancelledParams.push(parseInt(staffId));
    } else {
      directlyCancelledSql += ` AND b.user_id = ?`;
      directlyCancelledParams.push(userId);
    }

    const directlyCancelled = await query(
      directlyCancelledSql,
      directlyCancelledParams,
    );
    allRequests.push(...directlyCancelled);

    // مرتب‌سازی بر اساس تاریخ
    allRequests.sort((a, b) => {
      return (
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
    });

    return NextResponse.json({ success: true, changes: allRequests });
  } catch (error) {
    console.error("Error fetching booking changes:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت درخواست‌ها" },
      { status: 500 },
    );
  }
});


export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    const body = await req.json();
    const { id, action, reason, booking_id } = body;

    console.log("PUT request received:", {
      id,
      action,
      reason,
      booking_id,
      userType,
      staffId,
    });

    // ==================== لغو مستقیم نوبت توسط مدیر ====================
    if (action === "direct_cancel" && booking_id) {
      // دریافت اطلاعات نوبت
      const bookingData: any[] = await query(
        `SELECT b.*, u.business_name, u.phone as business_phone, s.name as staff_name
         FROM booking b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN staffs s ON b.staff_id = s.id
         WHERE b.id = ? AND b.user_id = ? AND b.status = 'active'`,
        [booking_id, userId]
      );

      if (bookingData.length === 0) {
        return NextResponse.json(
          { success: false, message: "نوبت یافت نشد یا قابل لغو نیست" },
          { status: 404 }
        );
      }

      const booking = bookingData[0];
      const persianDate = formatPersianDate(booking.booking_date);
      const timeDisplay = booking.booking_time;

      // لغو مستقیم نوبت
      await query(
        `UPDATE booking 
         SET status = 'cancelled', 
             customer_token = NULL, 
             updated_at = NOW(),
             cancelled_by = 'admin',
             cancel_reason = ?
         WHERE id = ?`,
        [reason || "لغو توسط مدیر", booking_id]
      );

      // ثبت در جدول booking_changes برای تاریخچه
      await query(
        `INSERT INTO booking_changes 
         (booking_id, client_name, client_phone, request_type, 
          old_date, old_time, reason, staff_id, requested_at, processed_at, status)
         VALUES (?, ?, ?, 'cancel', ?, ?, ?, ?, NOW(), NOW(), 'approved')`,
        [
          booking.id,
          booking.client_name,
          booking.client_phone,
          booking.booking_date,
          booking.booking_time,
          reason || "لغو توسط مدیر",
          booking.staff_id,
        ]
      );

      // ثبت نوتیفیکیشن
      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          userId,
          booking.id,
          `نوبت ${booking.client_name} در تاریخ ${persianDate} ساعت ${timeDisplay} توسط مدیر لغو شد. دلیل: ${reason || "بدون دلیل"}`,
        ]
      );

      // ثبت در smslog
      await query(
        `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at)
         VALUES (?, ?, ?, 'cancellation', 'sent', NOW())`,
        [
          userId,
          booking.client_phone,
          `نوبت شما در ${booking.business_name} توسط مدیر لغو شد. تاریخ: ${persianDate} - زمان: ${timeDisplay}${reason ? ` دلیل: ${reason}` : ''}`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    }

    // ==================== تایید یا رد درخواست‌های موجود ====================
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 },
      );
    }

    // ابتدا بررسی کنیم که این درخواست از کدام جدول است
    // 1. بررسی در booking_changes
    const changeFromChanges: any[] = await query(
      `SELECT bc.*, 
              b.user_id, 
              b.staff_id, 
              b.client_name, 
              b.client_phone, 
              b.booking_date, 
              b.booking_time,
              u.business_name, 
              u.phone as business_phone,
              s.calendar_type, 
              s.phone as staff_phone, 
              s.name as staff_name
       FROM booking_changes bc
       JOIN booking b ON bc.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN staffs s ON b.staff_id = s.id
       WHERE bc.id = ?`,
      [id],
    );

    let isFromChanges = changeFromChanges.length > 0;
    let change: any = isFromChanges ? changeFromChanges[0] : null;

    // 2. اگر در booking_changes نبود، بررسی در booking (درخواست نوبت جدید)
    if (!isFromChanges) {
      const newBookingRequest: any[] = await query(
        `SELECT 
          b.id as booking_id,
          b.user_id,
          b.staff_id,
          b.client_name,
          b.client_phone,
          b.booking_date,
          b.booking_time,
          b.booking_description as reason,
          b.status,
          u.business_name,
          u.phone as business_phone,
          s.calendar_type,
          s.phone as staff_phone,
          s.name as staff_name
        FROM booking b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN staffs s ON b.staff_id = s.id
        WHERE b.id = ? AND b.status = 'pending' AND b.source = 'customer_link'`,
        [id],
      );

      if (newBookingRequest.length > 0) {
        change = {
          ...newBookingRequest[0],
          request_type: "new_booking",
          old_date: newBookingRequest[0].booking_date,
          old_time: newBookingRequest[0].booking_time,
          new_date: null,
          new_time: null,
        };
        isFromChanges = false;
      }
    }

    if (!change) {
      console.log("Change not found for id:", id);
      return NextResponse.json(
        { success: false, message: "درخواست یافت نشد" },
        { status: 404 },
      );
    }

    console.log("Change found:", {
      changeId: change.id,
      requestType: change.request_type,
    });

    // بررسی دسترسی
    if (userType === "staff" && staffId) {
      if (change.staff_id !== parseInt(staffId)) {
        return NextResponse.json(
          { success: false, message: "شما به این درخواست دسترسی ندارید" },
          { status: 403 },
        );
      }
    } else {
      const isOwnerBooking = change.user_id === userId;
      const isSyncedStaffBooking =
        change.staff_id && change.calendar_type === "synced";
      if (!isOwnerBooking && !isSyncedStaffBooking) {
        return NextResponse.json(
          { success: false, message: "شما به این درخواست دسترسی ندارید" },
          { status: 403 },
        );
      }
    }

    let contactNumber = change.business_phone;
    if (change.staff_id && change.staff_phone) {
      contactNumber = change.staff_phone;
    }

    let responseMessage = "";

    if (action === "approve") {
      if (change.request_type === "reschedule") {
        let finalNewDate = change.new_date;
        if (finalNewDate instanceof Date) {
          finalNewDate = finalNewDate.toISOString().split("T")[0];
        } else if (
          typeof finalNewDate === "string" &&
          finalNewDate.includes("T")
        ) {
          finalNewDate = finalNewDate.split("T")[0];
        }

        await query(
          `UPDATE booking 
           SET booking_date = ?, booking_time = ?, change_count = change_count + 1, updated_at = NOW()
           WHERE id = ?`,
          [finalNewDate, change.new_time, change.booking_id],
        );

        await query(
          `UPDATE booking_changes 
           SET status = 'approved', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || null, id],
        );

        responseMessage = "درخواست تغییر زمان با موفقیت تایید شد";

        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "approved",
          salonName,
          contactNumber || "",
          finalNewDate,
          change.new_time,
          req,
        );
      } else if (change.request_type === "cancel") {
        await query(
          `UPDATE booking 
           SET status = 'cancelled', customer_token = NULL, updated_at = NOW(), cancelled_by = 'admin', cancel_reason = ?
           WHERE id = ?`,
          [reason || "درخواست لغو توسط مشتری", change.booking_id],
        );

        if (isFromChanges) {
          await query(
            `UPDATE booking_changes 
             SET status = 'approved', admin_reason = ?, processed_at = NOW()
             WHERE id = ?`,
            [reason || null, id],
          );
        }

        responseMessage = "درخواست لغو نوبت با موفقیت تایید شد";
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'active', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );
        responseMessage = "نوبت جدید با موفقیت تایید شد";
      }
    } else if (action === "reject") {
      if (change.request_type === "reschedule") {
        await query(
          `UPDATE booking_changes 
           SET status = 'rejected', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || "بدون دلیل", id],
        );
        responseMessage = "درخواست تغییر زمان رد شد";

        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "rejected",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );
      } else if (change.request_type === "cancel") {
        if (isFromChanges) {
          await query(
            `UPDATE booking_changes 
             SET status = 'rejected', admin_reason = ?, processed_at = NOW()
             WHERE id = ?`,
            [reason || "بدون دلیل", id],
          );
        }
        responseMessage = "درخواست لغو نوبت رد شد";
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'rejected', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );
        responseMessage = "درخواست نوبت جدید رد شد";
      }
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error processing booking change:", error);
    return NextResponse.json(
      { success: false, message: "خطا در پردازش درخواست" },
      { status: 500 },
    );
  }
});