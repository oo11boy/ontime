// src/app/api/client/booking-changes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

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
    let sql = `
      SELECT 
        bc.*,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i:%s') as old_time,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        b.staff_id as booking_staff_id,
        s.calendar_type,
        s.phone as staff_phone
      FROM booking_changes bc
      JOIN booking b ON bc.booking_id = b.id
      LEFT JOIN staffs s ON bc.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userType === "staff" && staffId) {
      // پرسنل: فقط درخواست‌های مربوط به نوبت‌های خودش
      sql += " AND b.staff_id = ?";
      params.push(parseInt(staffId));
    } else {
      // رئیس: فقط درخواست‌های نوبت‌های خودش + نوبت‌های پرسنل هماهنگ (synced)
      // پرسنل مستقل (independent) را شامل نمی‌شود
      sql += ` AND (
        b.staff_id IS NULL 
        OR b.staff_id IN (
          SELECT id FROM staffs 
          WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
        )
      )`;
      params.push(userId);
    }

    sql += " ORDER BY bc.requested_at DESC";

    const changes = await query(sql, params);

    return NextResponse.json({ success: true, changes });
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
    const { id, action, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 },
      );
    }

    // دریافت اطلاعات درخواست با JOIN به staffs برای دریافت شماره پرسنل
    const changes = await query(
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

    if (changes.length === 0) {
      return NextResponse.json(
        { success: false, message: "درخواست یافت نشد" },
        { status: 404 },
      );
    }

    const change = changes[0] as any;

    // بررسی دسترسی برای تایید/رد
    if (userType === "staff" && staffId) {
      // پرسنل: فقط می‌تواند درخواست‌های نوبت‌های خودش را تایید/رد کند
      if (change.staff_id !== parseInt(staffId)) {
        return NextResponse.json(
          { success: false, message: "شما به این درخواست دسترسی ندارید" },
          { status: 403 },
        );
      }
    } else {
      // رئیس: فقط می‌تواند درخواست‌های نوبت‌های خودش و پرسنل هماهنگ (synced) را تایید/رد کند
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

    // تعیین شماره تماس برای پیامک:
    // - اگر نوبت برای پرسنل است (staff_id وجود دارد) → شماره پرسنل (staff_phone)
    // - در غیر این صورت → شماره رئیس (business_phone)
    let contactNumber = change.business_phone;
    if (change.staff_id && change.staff_phone) {
      contactNumber = change.staff_phone;
    }

    let responseMessage = "";
    let newDateForSms = null;
    let newTimeForSms = null;

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

        newDateForSms = finalNewDate;
        newTimeForSms = change.new_time;

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

        responseMessage =
          "درخواست تغییر زمان با موفقیت تایید شد (۲ پیامک از موجودی کسر شد)";

        const salonName = change.business_name?.trim() || "مجموعه";

        const smsSent = await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "approved",
          salonName,
          contactNumber || "",
          finalNewDate,
          newTimeForSms,
          req,
        );

        return NextResponse.json({
          success: true,
          message:
            responseMessage +
            (smsSent
              ? " و پیامک به کاربر ارسال گردید"
              : " (ارسال پیامک با مشکل مواجه شد)"),
          sms_sent: smsSent,
          sms_cost: 2,
        });
      } else if (change.request_type === "cancel") {
        await query(
          `UPDATE booking 
           SET status = 'cancelled', customer_token = NULL, updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );

        await query(
          `UPDATE booking_changes 
           SET status = 'approved', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || null, id],
        );

        responseMessage = "درخواست لغو نوبت با موفقیت تایید شد";
      }
    } else if (action === "reject") {
      await query(
        `UPDATE booking_changes 
         SET status = 'rejected', admin_reason = ?, processed_at = NOW()
         WHERE id = ?`,
        [reason || "بدون دلیل", id],
      );
      responseMessage = "درخواست رد شد";

      if (change.request_type === "reschedule") {
        const salonName = change.business_name?.trim() || "مجموعه";

        const smsSent = await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "rejected",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );

        return NextResponse.json({
          success: true,
          message:
            responseMessage +
            (smsSent
              ? " و پیامک به کاربر ارسال گردید"
              : " (ارسال پیامک با مشکل مواجه شد)"),
          sms_sent: smsSent,
        });
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
