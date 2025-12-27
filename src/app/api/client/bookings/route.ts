import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";

// الفبای ۵۴ کاراکتری (حذف کاراکترهای مشابه مثل 0, O, 1, l برای جلوگیری از اشتباه مشتری)
const nanoid = customAlphabet(
  "346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
  4
);

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // --- متد GET: دریافت لیست نوبت‌ها و آپدیت وضعیت‌های قدیمی ---
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

  // --- متد POST: ثبت نوبت جدید با تضمین توکن یکتا ---
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

      // ۱. بررسی تداخل زمانی برای همان کاربر
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

      // ۲. تولید توکن ۴ کاراکتری یکتا (جلوگیری از تداخل)
      let customerToken = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        customerToken = nanoid();
        const [existing]: any = await query(
          "SELECT id FROM booking WHERE customer_token = ? LIMIT 1",
          [customerToken]
        );
        if (!existing) {
          isUnique = true;
        } else {
          attempts++;
        }
      }

      // سوپاپ اطمینان: اگر بعد از ۱۰ بار تداخل داشت (بسیار بعید)، طول را کمی بیشتر کن
      if (!isUnique)
        customerToken = customAlphabet(
          "346789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz",
          6
        )();

      // ۳. پیدا کردن پترن فعال
      const [template]: any = await query(
        `SELECT id, payamresan_id FROM smstemplates WHERE type = 'reserve' LIMIT 1`
      );

      const cleanedPhone = client_phone.replace(/\D/g, "");
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14);

      // ۴. درج در دیتابیس
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

      // ۵. به‌روزرسانی اطلاعات مشتری در جدول Clients
      await query(
        `INSERT INTO clients (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at)
         VALUES (?, ?, ?, 1, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         client_name = VALUES(client_name), total_bookings = total_bookings + 1, last_booking_date = VALUES(last_booking_date)`,
        [client_name.trim(), cleanedPhone, userId, booking_date]
      );

      return NextResponse.json(
        {
          success: true,
          bookingId: insertResult.insertId,
          customerToken,
          bookingLink: `${process.env.NEXT_PUBLIC_APP_URL}/c/${customerToken}`,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Booking Error:", error);
      return NextResponse.json({ message: "خطا در سرور" }, { status: 500 });
    }
  }

  // --- متد DELETE: لغو نوبت ---
  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      const [booking]: any = await query(
        "SELECT id FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking)
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });

      await query(
        "UPDATE booking SET status = 'cancelled', customer_token = NULL WHERE id = ?",
        [id]
      );
      await query(
        "UPDATE smslog SET status = 'cancelled' WHERE booking_id = ? AND status = 'pending'",
        [id]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    } catch (error) {
      return NextResponse.json({ message: "خطا در لغو نوبت" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };
