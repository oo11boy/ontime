import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";

// تولید توکن ۴ رقمی برای لینک نوبت مشتری
const nanoid = customAlphabet(
  "346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  4
);

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // --- متد GET: دریافت لیست و آپدیت خودکار وضعیت‌ها ---
  if (req.method === "GET") {
    try {
      // آپدیت نوبت‌های منقضی شده به وضعیت done
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

  // --- متد POST: ثبت نوبت با بررسی دقیق وضعیت بلاک ---
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
        sms_reserve_enabled = 0,
        sms_reminder_enabled = 0,
        sms_reminder_hours_before = 24,
      } = body;

      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          { message: "اطلاعات ضروری ناقص است" },
          { status: 400 }
        );
      }

      const cleanedPhone = client_phone.replace(/\D/g, "").slice(-10);

      // ۱. بررسی وضعیت بلاک و دریافت اطلاعات مشتری برای مودال فرانت‌اِند
      const [clientData]: any = await query(
        "SELECT id, is_blocked, cancelled_count, client_name FROM clients WHERE user_id = ? AND client_phone = ? LIMIT 1",
        [userId, cleanedPhone]
      );

      if (clientData && clientData.is_blocked === 1) {
        // ارسال پاسخ ۴۰۳ با دیتای کامل برای نمایش مودال رفع بلاک در فرانت
        return NextResponse.json(
          {
            success: false,
            isBlocked: true,
            clientId: clientData.id,
            clientName: clientData.client_name,
            cancelledCount: clientData.cancelled_count || 0,
            message: "مشتری مسدود شده است",
          },
          { status: 403 }
        );
      }

      // ۲. بررسی تداخل زمانی در نوبت‌های فعال
      const conflicts: any = await query(
        `SELECT id FROM booking WHERE user_id = ? AND booking_date = ? AND booking_time = ? AND status = 'active'`,
        [userId, booking_date, booking_time]
      );
      if (conflicts.length > 0) {
        return NextResponse.json(
          { message: "این زمان قبلاً رزرو شده است" },
          { status: 409 }
        );
      }

      // ۳. تولید توکن یکتا برای مشتری
      let customerToken = "";
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        customerToken = nanoid();
        const [existing]: any = await query(
          "SELECT id FROM booking WHERE customer_token = ? LIMIT 1",
          [customerToken]
        );
        if (!existing) isUnique = true;
        else attempts++;
      }

      // ۴. دریافت قالب پیامک رزرو فعال کاربر
      const [template]: any = await query(
        `SELECT id FROM smstemplates WHERE type = 'reserve' AND user_id = ? LIMIT 1`,
        [userId]
      );

      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14);

      // ۵. درج نوبت در جدول booking
      const insertResult: any = await query(
        `INSERT INTO booking
        (user_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services, status, sms_reserve_enabled, sms_reserve_template_id,
         sms_reminder_enabled, sms_reminder_hours_before, customer_token, token_expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, NOW())`,
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
          template?.id || null,
          sms_reminder_enabled ? 1 : 0,
          sms_reminder_hours_before,
          customerToken,
          tokenExpiresAt,
        ]
      );

      // ۶. بروزرسانی یا ثبت در جدول مشتریان (clients)
      await query(
        `INSERT INTO clients (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         client_name = VALUES(client_name), 
         total_bookings = total_bookings + 1, 
         last_booking_date = VALUES(last_booking_date), 
         updated_at = NOW()`,
        [client_name.trim(), cleanedPhone, userId, booking_date]
      );

      return NextResponse.json(
        {
          success: true,
          bookingId: insertResult.insertId,
          customerToken,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Critical Booking Error:", error);
      return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
    }
  }

  // --- متد DELETE: لغو نوبت ---
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
