import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  // --- متد GET: دریافت لیست نوبت‌ها ---
  if (req.method === "GET") {
    try {
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

      const cleanedPhone = client_phone.replace(/\D/g, "");

      const insertResult = (await query(
        `INSERT INTO booking
        (user_id, client_name, client_phone, booking_date, booking_time, duration_minutes,
         booking_description, services, status, sms_reserve_enabled, sms_reserve_custom_text,
         sms_reminder_enabled, sms_reminder_custom_text, sms_reminder_hours_before)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
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
        ]
      )) as any;

      return NextResponse.json(
        {
          success: true,
          message: "نوبت با موفقیت ثبت شد",
          bookingId: insertResult.insertId,
        },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json({ message: "خطا در ثبت نوبت" }, { status: 500 });
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

      await query(
        "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = ? AND user_id = ?",
        [id, userId]
      );
      // کنسل کردن پیامک‌های در انتظار ارسال
      await query(
        "UPDATE smslog SET status = 'cancelled' WHERE booking_id = ? AND status = 'pending'",
        [id]
      );

      return NextResponse.json({ message: "نوبت و یادآوری‌ها کنسل شدند" });
    } catch (error) {
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

      const allowedFields = [
        "client_name",
        "booking_date",
        "booking_time",
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
          updateData.sms_reminder_hours_before !== undefined
        ) {
          const [b]: any = await query(
            "SELECT booking_date, booking_time, sms_reminder_hours_before FROM booking WHERE id = ?",
            [id]
          );

          if (b) {
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
              `UPDATE smslog SET scheduled_at = ?, status = 'pending' 
               WHERE booking_id = ? AND status = 'pending' AND sms_type = 'reminder'`,
              [formattedScheduledAt, id]
            );
          }
        }
      }

      return NextResponse.json({ message: "به‌روزرسانی انجام شد" });
    } catch (error) {
      return NextResponse.json(
        { message: "خطا در به‌روزرسانی" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };
