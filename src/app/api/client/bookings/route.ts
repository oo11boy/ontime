// src/app/api/client/bookings/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";
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

  return `${jy}/${jm.toString().padStart(2, "0")}/${jd
    .toString()
    .padStart(2, "0")}`;
}

const nanoid = customAlphabet(
  "346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  4,
);

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  // ==================== GET: دریافت نوبت‌ها ====================
  if (req.method === "GET") {
    try {
      // به‌روزرسانی خودکار نوبت‌های گذشته به done
      await query(
        `UPDATE booking SET status = 'done', updated_at = NOW()
         WHERE user_id = ? AND status = 'active'
           AND ((booking_date < CURDATE()) OR (booking_date = CURDATE() AND booking_time < CURTIME()))`,
        [userId],
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

      // منطق دسترسی بر اساس نوع کاربر
      if (userType === "staff" && staffId) {
        const staff = await query<any>(
          "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
          [parseInt(staffId), userId],
        );

        const calendarType = staff?.[0]?.calendar_type;

        if (calendarType === "independent") {
          // تقویم مستقل: فقط نوبت‌های خود پرسنل
          sql += " AND b.staff_id = ?";
          params.push(parseInt(staffId));
        }
        // اگر calendar_type = "synced" باشد: همه نوبت‌ها را نشان بده
      } else {
        // رییس (user): فقط نوبت‌های خودش + نوبت‌های پرسنل با تقویم هماهنگ (synced)
        sql += ` AND (
          b.staff_id IS NULL 
          OR b.staff_id IN (
            SELECT id FROM staffs 
            WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
          )
        )`;
        params.push(userId);
      }

      if (dateFilter) {
        sql += " AND b.booking_date = ?";
        params.push(dateFilter);
      }

      sql += " ORDER BY b.booking_date DESC, b.booking_time DESC";
      const bookings = await query<any>(sql, params);

      return NextResponse.json({ bookings });
    } catch (error) {
      console.error("[BOOKINGS GET] Error:", error);
      return NextResponse.json(
        { message: "خطا در دریافت لیست" },
        { status: 500 },
      );
    }
  }

  // ==================== POST: ثبت نوبت جدید ====================
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
        reserve_message_count = 1,
        reminder_message_count = 1,
        staff_id = null,
      } = body;

      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          { message: "اطلاعات ضروری ناقص است" },
          { status: 400 },
        );
      }

      const cleanedPhone = client_phone.replace(/\D/g, "").slice(-10);

      // بررسی مسدودیت مشتری
      const [clientData]: any = await query(
        "SELECT id, is_blocked, cancelled_count, client_name FROM clients WHERE user_id = ? AND client_phone = ? LIMIT 1",
        [userId, cleanedPhone],
      );

      if (clientData?.is_blocked === 1) {
        return NextResponse.json(
          { success: false, isBlocked: true, message: "مشتری مسدود شده است" },
          { status: 403 },
        );
      }

      // بررسی تداخل زمانی
      let conflictCheckSql = `
        SELECT id, staff_id FROM booking 
        WHERE user_id = ? AND booking_date = ? AND booking_time = ? AND status = 'active'
      `;
      let conflictParams: any[] = [userId, booking_date, booking_time];

      // اگر کاربر از نوع رییس است
      if (userType !== "staff") {
        // رییس: فقط تداخل با نوبت‌های خودش (staff_id IS NULL) و نوبت‌های پرسنل هماهنگ (synced)
        conflictCheckSql += ` AND (
          staff_id IS NULL 
          OR staff_id IN (
            SELECT id FROM staffs 
            WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
          )
        )`;
        conflictParams.push(userId);
      }
      // اگر کاربر از نوع پرسنل است
      else if (userType === "staff" && staffId) {
        const staff = await query<any>(
          "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
          [parseInt(staffId), userId],
        );
        const calendarType = staff?.[0]?.calendar_type;

        if (calendarType === "independent") {
          // پرسنل با تقویم مستقل: فقط تداخل با نوبت‌های خودش
          conflictCheckSql += " AND staff_id = ?";
          conflictParams.push(parseInt(staffId));
        }
        // پرسنل با تقویم هماهنگ (synced): تداخل با نوبت‌های رییس و خودش (همان کوئری اصلی)
        // نیازی به شرط اضافی نیست چون قبلاً همه نوبت‌ها را می‌گیرد
      }

      const conflicts: any = await query(conflictCheckSql, conflictParams);
      if (conflicts.length > 0) {
        return NextResponse.json(
          { message: "این زمان قبلاً رزرو شده است" },
          { status: 409 },
        );
      }

      let customerToken = nanoid();
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14);

      const [defaultReserveTemplate]: any = await query(
        "SELECT id, payamresan_id FROM smstemplates WHERE type = 'reserve' AND (user_id = ? OR user_id IS NULL) ORDER BY user_id DESC LIMIT 1",
        [userId],
      );

      // تعیین staff_id نهایی برای نوبت
      let finalStaffId = null;
      if (staff_id) {
        finalStaffId = staff_id;
      } else if (userType === "staff" && staffId) {
        finalStaffId = parseInt(staffId);
      }

      const insertResult: any = await query(
        `INSERT INTO booking
        (user_id, staff_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services, status, sms_reserve_enabled, sms_reserve_template_id,
         sms_reserve_pattern, sms_reminder_enabled, sms_reminder_hours_before,
         sms_reminder_pattern, customer_token, token_expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          finalStaffId,
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
        ],
      );

      // اصلاح: دسترسی صحیح به insertId
      let newBookingId;
      if (Array.isArray(insertResult) && insertResult.length > 0) {
        newBookingId = insertResult[0].insertId;
      } else if (insertResult && typeof insertResult === "object") {
        newBookingId = insertResult.insertId;
      } else {
        newBookingId = insertResult;
      }

      // به‌روزرسانی یا ایجاد مشتری در جدول clients
      await query(
        `INSERT INTO clients (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE client_name = VALUES(client_name), total_bookings = total_bookings + 1, last_booking_date = VALUES(last_booking_date), updated_at = NOW()`,
        [client_name.trim(), cleanedPhone, userId, booking_date],
      );

      // اگر پرسنل است و مشتری جدید است، ارتباط ثبت شود
      if (userType === "staff" && staffId && finalStaffId) {
        const [newClient]: any = await query(
          "SELECT id FROM clients WHERE user_id = ? AND client_phone = ?",
          [userId, cleanedPhone],
        );
        if (newClient) {
          await query(
            "INSERT IGNORE INTO staff_client_relation (staff_id, client_id) VALUES (?, ?)",
            [parseInt(staffId), newClient.id],
          );
        }
      }

      // ارسال پیامک (در صورت فعال بودن)
      if (sms_reserve_enabled || sms_reminder_enabled) {
        const customerLink = `https://ontimeapp.ir/${customerToken}`;
        const [userData]: any = await query(
          "SELECT business_name, name FROM users WHERE id = ?",
          [userId],
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
              template_key:
                reserve_pattern || defaultReserveTemplate?.payamresan_id,
              message_count: reserve_message_count,
            }),
          });
        }

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
              message_count: reminder_message_count,
            }),
          });
        }
      }

      return NextResponse.json(
        { success: true, bookingId: newBookingId, customerToken },
        { status: 201 },
      );
    } catch (error: any) {
      console.error("[BOOKINGS POST] Error:", error);
      return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
    }
  }

  // ==================== DELETE: لغو نوبت ====================
  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      const result: any = await query(
        "UPDATE booking SET status = 'cancelled', customer_token = NULL WHERE id = ? AND user_id = ?",
        [id, userId],
      );
      if (result.affectedRows === 0)
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    } catch (error) {
      console.error("[BOOKINGS DELETE] Error:", error);
      return NextResponse.json({ message: "خطا در لغو نوبت" }, { status: 500 });
    }
  }

  // ==================== PATCH: ویرایش نوبت ====================
  if (req.method === "PATCH") {
    try {
      const body = await req.json();
      const { id, ...updateData } = body;

      if (!id) {
        return NextResponse.json(
          { message: "شناسه نوبت الزامی است" },
          { status: 400 },
        );
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.client_name !== undefined) {
        fields.push("client_name = ?");
        values.push(updateData.client_name.trim());
      }
      if (updateData.client_phone !== undefined) {
        const cleanedPhone = updateData.client_phone
          .replace(/\D/g, "")
          .slice(-10);
        fields.push("client_phone = ?");
        values.push(cleanedPhone);
      }
      if (updateData.booking_date !== undefined) {
        fields.push("booking_date = ?");
        values.push(updateData.booking_date);
      }
      if (updateData.booking_time !== undefined) {
        fields.push("booking_time = ?");
        values.push(updateData.booking_time);
      }
      if (updateData.duration_minutes !== undefined) {
        fields.push("duration_minutes = ?");
        values.push(updateData.duration_minutes);
      }
      if (updateData.booking_description !== undefined) {
        fields.push("booking_description = ?");
        values.push(updateData.booking_description.trim());
      }
      if (updateData.services !== undefined) {
        fields.push("services = ?");
        values.push(updateData.services.trim());
      }
      if (updateData.status !== undefined) {
        fields.push("status = ?");
        values.push(updateData.status);
      }

      if (fields.length === 0) {
        return NextResponse.json(
          { message: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است" },
          { status: 400 },
        );
      }

      fields.push("updated_at = NOW()");
      values.push(id, userId);

      await query(
        `UPDATE booking SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
        values,
      );

      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت ویرایش شد",
      });
    } catch (error) {
      console.error("[BOOKINGS PATCH] Error:", error);
      return NextResponse.json(
        { message: "خطا در ویرایش نوبت" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };
