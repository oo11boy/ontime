import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // --- متد GET: دریافت لیست نوبت‌ها ---
  if (req.method === "GET") {
    try {
      // به‌روزرسانی وضعیت نوبت‌های گذشته
      await query(
        `UPDATE booking
         SET status = 'done', updated_at = NOW()
         WHERE user_id = ? AND status = 'active'
           AND ((booking_date < CURDATE()) OR (booking_date = CURDATE() AND booking_time < CURTIME()))`,
        [userId]
      );

      const url = new URL(req.url);
      const statusFilter = url.searchParams.get("status") || "active";
      const dateFilter = url.searchParams.get("date");

      let sql = `
        SELECT b.*, t1.title AS reserve_template_title, t2.title AS reminder_template_title
        FROM booking b
        LEFT JOIN smstemplates t1 ON b.sms_reserve_template_id = t1.id
        LEFT JOIN smstemplates t2 ON b.sms_reminder_template_id = t2.id
        WHERE b.user_id = ? AND b.status = ?
      `;
      const params: any[] = [userId, statusFilter];

      if (dateFilter) {
        sql += " AND b.booking_date = ?";
        params.push(dateFilter);
      }

      sql += " ORDER BY b.booking_date DESC, b.booking_time DESC";
      const bookings = await query<any>(sql, params);

      return NextResponse.json({
        message: "Bookings list fetched successfully",
        bookings,
      });
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
  }

  // --- متد POST: ثبت نوبت جدید ---
  if (req.method === "POST") {
    try {
      const body = await req.json();

      const client_name = body.client_name || "";
      const client_phone = body.client_phone || "";
      const booking_date = body.booking_date;
      const booking_time = body.booking_time;
      const duration_minutes = Number(body.duration_minutes) || 30;
      const booking_description = body.booking_description || "";
      const services = body.services || "";
      const sms_reserve_enabled = body.sms_reserve_enabled ? 1 : 0;
      const sms_reserve_custom_text = body.sms_reserve_custom_text || "";
      const sms_reminder_enabled = body.sms_reminder_enabled ? 1 : 0;
      const sms_reminder_custom_text = body.sms_reminder_custom_text || "";
      const sms_reminder_hours_before =
        Number(body.sms_reminder_hours_before) || 24;

      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          { message: "اطلاعات ضروری ناقص است" },
          { status: 400 }
        );
      }

      // بررسی تداخل زمانی
      const conflictingBookings = await query(
        `SELECT id FROM booking 
         WHERE user_id = ? 
           AND booking_date = ? 
           AND booking_time = ? 
           AND status = 'active'`,
        [userId, booking_date, booking_time]
      );

      if (conflictingBookings.length > 0) {
        return NextResponse.json(
          { message: "این زمان قبلاً رزرو شده است" },
          { status: 409 }
        );
      }

      const cleanedPhone = client_phone.replace(/\D/g, "");

      // ایجاد توکن منحصر به فرد برای مشتری
      const customerToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 روز اعتبار

      const insertResult = (await query(
        `INSERT INTO booking
        (user_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services, status, sms_reserve_enabled, sms_reserve_custom_text,
         sms_reminder_enabled, sms_reminder_custom_text, sms_reminder_hours_before,
         customer_token, token_expires_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          client_name.trim(),
          cleanedPhone,
          booking_date,
          booking_time,
          duration_minutes,
          booking_description.trim(),
          services.trim(),
          sms_reserve_enabled,
          sms_reserve_custom_text.trim(),
          sms_reminder_enabled,
          sms_reminder_custom_text.trim(),
          sms_reminder_hours_before,
          customerToken,
          tokenExpiresAt,
        ]
      )) as any;

      // بروزرسانی یا ایجاد رکورد مشتری
      await query(
        `INSERT INTO clients 
         (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at)
         VALUES (?, ?, ?, 1, ?, NOW())
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
          message: "نوبت با موفقیت ثبت شد",
          bookingId: insertResult.insertId,
          customerToken, // ارسال توکن به فرانت‌اند
          bookingLink: `${
            process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin")
          }/customer/booking/${customerToken}`,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error creating booking:", error);
      return NextResponse.json(
        { message: error.message || "خطا در ثبت نوبت" },
        { status: 500 }
      );
    }
  }

  // --- متد DELETE: کنسل کردن نوبت ---
  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      if (!id)
        return NextResponse.json(
          { message: "آی‌دی الزامی است" },
          { status: 400 }
        );

      // بررسی وجود نوبت و مالکیت
      const [booking]: any = await query(
        "SELECT customer_token, status FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking) {
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      }

      await query(
        "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      // باطل کردن توکن مشتری
      await query(
        "UPDATE booking SET customer_token = NULL, token_expires_at = NULL WHERE id = ?",
        [id]
      );

      // کنسل کردن پیامک‌های در انتظار ارسال
      await query(
        "UPDATE smslog SET status = 'cancelled' WHERE booking_id = ? AND status = 'pending'",
        [id]
      );

      // لاگ لغو نوبت
      await query(
        `INSERT INTO smslog 
         (user_id, booking_id, to_phone, content, sms_type, status, created_at)
         SELECT user_id, ?, client_phone, 'نوبت شما لغو شد.', 'cancellation', 'sent', NOW()
         FROM booking WHERE id = ?`,
        [id, id]
      );

      return NextResponse.json({
        message: "نوبت و یادآوری‌ها کنسل شدند",
        success: true,
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return NextResponse.json(
        { message: "خطا در کنسل کردن" },
        { status: 500 }
      );
    }
  }

  // --- متد PATCH: به‌روزرسانی نوبت و زمان‌بندی پیامک ---
  if (req.method === "PATCH") {
    try {
      const { id, ...updateData } = await req.json();
      if (!id)
        return NextResponse.json(
          { message: "آی‌دی الزامی است" },
          { status: 400 }
        );

      // بررسی وجود نوبت و مالکیت
      const [existingBooking]: any = await query(
        "SELECT * FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!existingBooking) {
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      }

      const allowedFields = [
        "client_name",
        "booking_date",
        "booking_time",
        "duration_minutes",
        "booking_description",
        "services",
        "sms_reminder_enabled",
        "sms_reminder_hours_before",
      ];

      const fields: string[] = [];
      const values: any[] = [];

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      // اگر تاریخ یا زمان تغییر کرد، بررسی تداخل
      if (updateData.booking_date || updateData.booking_time) {
        const checkDate =
          updateData.booking_date || existingBooking.booking_date;
        const checkTime =
          updateData.booking_time || existingBooking.booking_time;

        const conflicts = await query(
          `SELECT id FROM booking 
           WHERE user_id = ? 
             AND booking_date = ? 
             AND booking_time = ? 
             AND status = 'active'
             AND id != ?`,
          [userId, checkDate, checkTime, id]
        );

        if (conflicts.length > 0) {
          return NextResponse.json(
            { message: "این زمان قبلاً رزرو شده است" },
            { status: 409 }
          );
        }
      }

      // افزایش شمارنده تغییرات اگر تاریخ یا زمان تغییر کرد
      if (updateData.booking_date || updateData.booking_time) {
        fields.push("change_count = change_count + 1");
      }

      if (fields.length > 0) {
        fields.push("updated_at = NOW()");
        await query(
          `UPDATE booking SET ${fields.join(
            ", "
          )} WHERE id = ? AND user_id = ?`,
          [...values, id, userId]
        );

        // ✅ اصلاح منطق زمان‌بندی یادآوری (جلوگیری از اختلاف ساعت)
        if (
          updateData.booking_date ||
          updateData.booking_time ||
          updateData.sms_reminder_hours_before !== undefined ||
          updateData.sms_reminder_enabled !== undefined
        ) {
          const [b]: any = await query(
            "SELECT booking_date, booking_time, sms_reminder_hours_before, sms_reminder_enabled FROM booking WHERE id = ?",
            [id]
          );

          if (b && b.sms_reminder_enabled) {
            const hoursBefore = Number(b.sms_reminder_hours_before) || 24;
            const dateObj = new Date(`${b.booking_date}T${b.booking_time}`);

            // کسر زمان یادآوری
            dateObj.setHours(dateObj.getHours() - hoursBefore);

            // استخراج دستی برای حفظ ساعت محلی
            const Y = dateObj.getFullYear();
            const M = String(dateObj.getMonth() + 1).padStart(2, "0");
            const D = String(dateObj.getDate()).padStart(2, "0");
            const h = String(dateObj.getHours()).padStart(2, "0");
            const m = String(dateObj.getMinutes()).padStart(2, "0");
            const s = String(dateObj.getSeconds()).padStart(2, "0");

            const formattedScheduledAt = `${Y}-${M}-${D} ${h}:${m}:${s}`;

            await query(
              `UPDATE smslog 
               SET scheduled_at = ?, 
                   status = CASE WHEN scheduled_at < NOW() THEN 'cancelled' ELSE 'pending' END
               WHERE booking_id = ? AND sms_type = 'reminder'`,
              [formattedScheduledAt, id]
            );
          }
        }
      }

      // بازگرداندن اطلاعات به‌روز شده
      const [updatedBooking]: any = await query(
        "SELECT * FROM booking WHERE id = ?",
        [id]
      );

      return NextResponse.json({
        message: "به‌روزرسانی انجام شد",
        success: true,
        booking: updatedBooking,
      });
    } catch (error: any) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { message: error.message || "خطا در به‌روزرسانی" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };
