import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";

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

  return `${jy}/${jm.toString().padStart(2, "0")}/${jd
    .toString()
    .padStart(2, "0")}`;
}

const nanoid = customAlphabet(
  "346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  4
);

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  if (req.method === "GET") {
    try {
      await query(
        `UPDATE booking SET status = 'done', updated_at = NOW()
         WHERE user_id = ? AND status = 'active'
           AND ((booking_date < CURDATE()) OR (booking_date = CURDATE() AND booking_time < CURTIME()))`,
        [userId]
      );

      const url = new URL(req.url);
      const statusFilter = url.searchParams.get("status") || "active";
      const dateFilter = url.searchParams.get("date");

      let sql = `
        SELECT b.*, t1.name AS reserve_tpl_name, t1.payamresan_id AS reserve_pattern
        FROM booking b
        LEFT JOIN smstemplates t1 ON b.sms_reserve_template_id = t1.id
        WHERE b.user_id = ? AND b.status = ?
      `;
      const params: any[] = [userId, statusFilter];

      if (dateFilter) {
        sql += " AND b.booking_date = ?";
        params.push(dateFilter);
      }

      sql += " ORDER BY b.booking_date DESC, b.booking_time DESC";
      const bookings = await query<any>(sql, params);

      return NextResponse.json({ bookings });
    } catch (error) {
      return NextResponse.json(
        { message: "خطا در دریافت لیست" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        client_name,
        client_phone,
        booking_date,
        booking_time,
        duration_minutes = 30,
        booking_description = "",
        services = "",
        sms_reserve_enabled = false,
        sms_reminder_enabled = false,
        sms_reminder_hours_before = 24,
        reserve_pattern = null,
        reminder_pattern = null,
        reserve_message_count = 1,   // تعداد صفحات پیامک رزرو (از فرانت می‌آید)
        reminder_message_count = 1, // تعداد صفحات پیامک یادآوری (از فرانت می‌آید)
      } = body;

      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          { message: "اطلاعات ضروری ناقص است" },
          { status: 400 }
        );
      }

      const cleanedPhone = client_phone.replace(/\D/g, "").slice(-10);

      const [clientData]: any = await query(
        "SELECT id, is_blocked, cancelled_count, client_name FROM clients WHERE user_id = ? AND client_phone = ? LIMIT 1",
        [userId, cleanedPhone]
      );

      if (clientData?.is_blocked === 1) {
        return NextResponse.json(
          { success: false, isBlocked: true, message: "مشتری مسدود شده است" },
          { status: 403 }
        );
      }

      const conflicts: any = await query(
        "SELECT id FROM booking WHERE user_id = ? AND booking_date = ? AND booking_time = ? AND status = 'active'",
        [userId, booking_date, booking_time]
      );
      if (conflicts.length > 0) {
        return NextResponse.json(
          { message: "این زمان قبلاً رزرو شده است" },
          { status: 409 }
        );
      }

      let customerToken = nanoid();
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14);

      const [defaultReserveTemplate]: any = await query(
        "SELECT id, payamresan_id FROM smstemplates WHERE type = 'reserve' AND (user_id = ? OR user_id IS NULL) ORDER BY user_id DESC LIMIT 1",
        [userId]
      );

      const insertResult: any = await query(
        `INSERT INTO booking
        (user_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services, status, sms_reserve_enabled, sms_reserve_template_id,
         sms_reserve_pattern, sms_reminder_enabled, sms_reminder_hours_before,
         sms_reminder_pattern, customer_token, token_expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          client_name.trim(),
          cleanedPhone,
          booking_date,
          booking_time,
          duration_minutes,
          booking_description.trim(),
          services.trim(),
          sms_reserve_enabled ? 1 : 0,
          defaultReserveTemplate?.id || null,
          reserve_pattern || defaultReserveTemplate?.payamresan_id || null,
          sms_reminder_enabled ? 1 : 0,
          sms_reminder_hours_before,
          reminder_pattern || null,
          customerToken,
          tokenExpiresAt,
        ]
      );

      const newBookingId = insertResult.insertId;

      await query(
        `INSERT INTO clients (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE client_name = VALUES(client_name), total_bookings = total_bookings + 1, last_booking_date = VALUES(last_booking_date), updated_at = NOW()`,
        [client_name.trim(), cleanedPhone, userId, booking_date]
      );

      // فقط اگر حداقل یکی از پیامک‌ها فعال باشد، پردازش پیامک انجام شود
      if (sms_reserve_enabled || sms_reminder_enabled) {
        const customerLink = `https://ontimeapp.ir/${customerToken}`;
        const [userData]: any = await query(
          "SELECT business_name, name FROM users WHERE id = ?",
          [userId]
        );
        const salonName =
          userData?.business_name?.trim() ||
          userData?.name?.trim() ||
          "آن‌تایم";

        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL ||
          req.headers.get("origin") ||
          "https://ontimeapp.ir";

        const [gy, gm, gd] = booking_date.split("-").map(Number);
        const jalaliDate = gregorianToJalali(gy, gm, gd);

        // پیامک تایید رزرو
        if (sms_reserve_enabled) {
          await fetch(`${baseUrl}/api/sms/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              to_phone: cleanedPhone,
              sms_type: "reservation",
              booking_id: newBookingId,
              name: client_name.trim(),
              date: jalaliDate,
              time: booking_time,
              service: services.trim() || "خدمات",
              link: customerLink,
              salon: salonName,
              template_key: reserve_pattern || defaultReserveTemplate?.payamresan_id,
              message_count: reserve_message_count, // دقیقاً همون مقداری که از فرانت اومده
            }),
          });
        }

        // پیامک یادآوری
        if (sms_reminder_enabled) {
          await fetch(`${baseUrl}/api/sms/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              to_phone: cleanedPhone,
              sms_type: "reminder",
              booking_id: newBookingId,
              booking_date,
              booking_time,
              sms_reminder_hours_before,
              name: client_name.trim(),
              date: jalaliDate,
              time: booking_time,
              service: services.trim() || "خدمات",
              link: customerLink,
              salon: salonName,
              template_key: reminder_pattern,
              message_count: reminder_message_count, // دقیقاً همون مقداری که از فرانت اومده
            }),
          });
        }
      }

      return NextResponse.json(
        { success: true, bookingId: newBookingId, customerToken },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("[BOOKINGS POST] Error:", error);
      return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      const result: any = await query(
        "UPDATE booking SET status = 'cancelled', customer_token = NULL WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      if (result.affectedRows === 0)
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    } catch (error) {
      return NextResponse.json({ message: "خطا در لغو نوبت" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE };