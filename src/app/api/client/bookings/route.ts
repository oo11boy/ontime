// File Path: src\app\api\bookings\route.ts
import { NextResponse } from "next/server";
import { query, QueryResult } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { getTotalSmsBalance } from '@/lib/sms-utils'; // فقط برای چک اولیه موجودی

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // GET: لیست نوبت‌ها (بدون تغییر)
  if (req.method === "GET") {
    try {
      // به‌روزرسانی وضعیت نوبت‌های گذشته
      await query(
        `UPDATE booking
         SET status = 'done',
             updated_at = NOW()
         WHERE user_id = ?
           AND status = 'active'
           AND (
             (booking_date < CURDATE()) OR
             (booking_date = CURDATE() AND booking_time < CURTIME())
           )`,
        [userId]
      );

      const url = new URL(req.url);
      const statusFilter = url.searchParams.get("status") || "active";
      const dateFilter = url.searchParams.get("date");

      let sql = `
        SELECT
          b.id, b.client_name, b.client_phone, b.booking_date, b.booking_time,
          b.booking_description, b.status, b.services,
          b.sms_reserve_enabled, b.sms_reminder_enabled, b.sms_reminder_hours_before,
          b.sms_reserve_custom_text, b.sms_reminder_custom_text,
          t1.title AS reserve_template_title,
          t2.title AS reminder_template_title
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
      console.error("Failed to fetch bookings:", error);
      return NextResponse.json(
        { message: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
  }

  // POST: ثبت نوبت جدید
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
        sms_reserve_custom_text = "",
        sms_reminder_enabled = false,
        sms_reminder_custom_text = "",
        sms_reminder_hours_before = 24,
      } = body;

      console.log("📥 دریافت داده‌های نوبت:", {
        client_name,
        client_phone,
        booking_date,
        booking_time,
        duration_minutes,
        userId,
      });

      // اعتبارسنجی‌ها
      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          { message: "فیلدهای ضروری خالی هستند" },
          { status: 400 }
        );
      }

      const cleanedPhone = client_phone.replace(/\D/g, "");
      if (cleanedPhone.length < 10 || cleanedPhone.length > 12) {
        return NextResponse.json(
          { message: "فرمت شماره تلفن نامعتبر است" },
          { status: 400 }
        );
      }

      const currentDate = new Date().toISOString().split("T")[0];
      if (booking_date < currentDate) {
        return NextResponse.json(
          { message: "تاریخ نمی‌تواند در گذشته باشد" },
          { status: 400 }
        );
      }

      // چک تداخل زمانی
      const conflictingBookings: any[] = await query(
        `SELECT id, client_name, booking_time, duration_minutes
         FROM booking
         WHERE user_id = ?
           AND booking_date = ?
           AND status = 'active'
           AND (
             (TIME_TO_SEC(booking_time) < TIME_TO_SEC(?) + ? * 60)
             AND
             (TIME_TO_SEC(booking_time) + (duration_minutes) * 60 > TIME_TO_SEC(?))
           )`,
        [userId, booking_date, booking_time, duration_minutes, booking_time]
      );

      if (conflictingBookings.length > 0) {
        return NextResponse.json(
          {
            message: "این زمان با نوبت دیگری تداخل دارد",
            conflicting: conflictingBookings.map(b => ({
              id: b.id,
              name: b.client_name,
              time: b.booking_time,
              duration: b.duration_minutes || 30,
            })),
          },
          { status: 409 }
        );
      }

      // محاسبه تعداد پیامک (فقط برای چک اولیه)
      const totalSmsNeeded =
        (sms_reserve_enabled ? 1 : 0) + (sms_reminder_enabled ? 1 : 0);

 

      // ثبت نوبت
      const insertSql = `
        INSERT INTO booking
        (user_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services,
         status, sms_reserve_enabled, sms_reserve_custom_text,
         sms_reminder_enabled, sms_reminder_custom_text, sms_reminder_hours_before)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
      `;

      const insertResult = await query(insertSql, [
        userId,
        client_name.trim(),
        cleanedPhone,
        booking_date,
        booking_time,
        duration_minutes,
        booking_description.trim(),
        services.trim(),
        sms_reserve_enabled ? 1 : 0,
        sms_reserve_custom_text.trim(),
        sms_reminder_enabled ? 1 : 0,
        sms_reminder_custom_text.trim(),
        sms_reminder_hours_before,
      ]) as any; // Type assertion برای دسترسی به insertId

      const bookingId = insertResult.insertId;

      // به‌روزرسانی clients
      await query(
        `INSERT INTO clients
         (client_name, client_phone, user_id, last_booking_date, total_bookings, created_at)
         VALUES (?, ?, ?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE
         client_name = VALUES(client_name),
         last_booking_date = VALUES(last_booking_date),
         total_bookings = total_bookings + 1,
         updated_at = NOW()`,
        [client_name.trim(), cleanedPhone, userId, booking_date]
      );

      // به‌روزرسانی نام مشتری در نوبت‌های آینده (اگر تغییر کرده)
      const [existingClient]: any = await query(
        "SELECT client_name FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, cleanedPhone]
      );

      if (existingClient && existingClient.client_name !== client_name.trim()) {
        await query(
          `UPDATE booking
           SET client_name = ?,
               updated_at = NOW()
           WHERE user_id = ?
             AND client_phone = ?
             AND status = 'active'
             AND (
               booking_date > CURDATE() OR
               (booking_date = CURDATE() AND booking_time > CURTIME())
             )`,
          [client_name.trim(), userId, cleanedPhone]
        );
      }

      // حذف کامل ارسال پیامک‌ها و کسر موجودی از اینجا
      // حالا همه چیز (ارسال + کسر + لاگ) در فرانت‌اند با sendSingleSms مدیریت می‌شه

      return NextResponse.json(
        {
          message: "نوبت با موفقیت ثبت شد",
          bookingId,
          smsReserved: sms_reserve_enabled,
          smsReminder: sms_reminder_enabled,
          smsCount: totalSmsNeeded,
          booking: {
            id: bookingId,
            client_name: client_name.trim(),
            client_phone: cleanedPhone,
            booking_date,
            booking_time,
            duration_minutes,
            services,
            status: "active",
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("خطا در ثبت نوبت:", error);
      return NextResponse.json(
        { message: "خطا در ثبت نوبت" },
        { status: 500 }
      );
    }
  }

  // DELETE: کنسل نوبت (بدون تغییر)
  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      
      if (!id) {
        return NextResponse.json({ message: "آی‌دی نوبت الزامی است" }, { status: 400 });
      }

      const [booking]: any = await query(
        "SELECT id, status, client_phone FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking) {
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      }

      await query(
        "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
        [id]
      );

      return NextResponse.json({
        message: "نوبت با موفقیت کنسل شد",
        bookingId: id,
      });
    } catch (error) {
      console.error("خطا در کنسل کردن نوبت:", error);
      return NextResponse.json({ message: "خطا در کنسل کردن نوبت" }, { status: 500 });
    }
  }

  // PATCH: به‌روزرسانی نوبت (بدون تغییر)
  if (req.method === "PATCH") {
    try {
      const { id, ...updateData } = await req.json();
      
      if (!id) {
        return NextResponse.json({ message: "آی‌دی نوبت الزامی است" }, { status: 400 });
      }

      const [booking]: any = await query(
        "SELECT id FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking) {
        return NextResponse.json({ message: "نوبت یافت نشد" }, { status: 404 });
      }

      const allowedFields = [
        'client_name', 'client_phone', 'booking_date', 'booking_time',
        'booking_description', 'services', 'sms_reserve_enabled',
        'sms_reserve_custom_text', 'sms_reminder_enabled',
        'sms_reminder_custom_text', 'sms_reminder_hours_before'
      ];

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
      });

      if (updateFields.length === 0) {
        return NextResponse.json(
          { message: "هیچ فیلد معتبری برای به‌روزرسانی ارسال نشده" },
          { status: 400 }
        );
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id, userId);

      const updateSql = `
        UPDATE booking 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND user_id = ?
      `;

      await query(updateSql, updateValues);

      return NextResponse.json({
        message: "نوبت با موفقیت به‌روزرسانی شد",
        bookingId: id,
      });
    } catch (error) {
      console.error("خطا در به‌روزرسانی نوبت:", error);
      return NextResponse.json({ message: "خطا در به‌روزرسانی نوبت" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };