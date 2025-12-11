// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { query, QueryResult } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// یک handler مشترک برای GET و POST
const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context; // userId از withAuth تزریق شده

  // ------------------------------------------------------------------
  // GET: لیست نوبت‌ها
  // ------------------------------------------------------------------
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const statusFilter = url.searchParams.get("status") || "active";
      const dateFilter = url.searchParams.get("date");

      let sql = `
                SELECT 
                    b.id, b.client_name, b.client_phone, b.booking_date, b.booking_time, 
                    b.booking_description, b.status,
                    b.sms_reserve_enabled, b.sms_reminder_enabled, b.sms_reminder_hours_before,
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

  // ------------------------------------------------------------------
  // POST: ثبت نوبت جدید
  // ------------------------------------------------------------------
  if (req.method === "POST") {
    try {
      const {
        client_name,
        client_phone,
        booking_date,
        booking_time,
        booking_description = "",
        sms_reserve_enabled = false,
        sms_reserve_template_id,
        sms_reminder_enabled = false,
        sms_reminder_template_id,
        sms_reminder_hours_before,
      } = await req.json();

      // اعتبارسنجی فیلدهای ضروری
      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          {
            message:
              "Required fields missing: client_name, client_phone, booking_date, booking_time",
          },
          { status: 400 }
        );
      }

      // 1. ثبت نوبت در دیتابیس
      const insertSql = `
                INSERT INTO booking 
                (user_id, client_name, client_phone, booking_date, booking_time, booking_description, 
                 status, sms_reserve_enabled, sms_reserve_template_id, 
                 sms_reminder_enabled, sms_reminder_template_id, sms_reminder_hours_before) 
                VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
            `;

      const result = await query<QueryResult>(insertSql, [
        userId,
        client_name,
        client_phone,
        booking_date,
        booking_time,
        booking_description,
        sms_reserve_enabled ? 1 : 0,
        sms_reserve_template_id,
        sms_reserve_template_id || null,
        sms_reminder_enabled ? 1 : 0,
        sms_reminder_template_id || null,
        sms_reminder_hours_before || null,
      ]);

      const bookingId = result[0].insertId;

      // 2. ارسال SMS رزرو (فوری (اگر فعال بود)
      if (sms_reserve_enabled) {
        const [userRow]: any = await query(
          "SELECT sms_balance FROM users WHERE id = ?",
          [userId]
        );

        if (userRow && userRow.sms_balance > 0) {
          const templateId = sms_reserve_template_id || 1; // پیش‌فرض قالب ۱
          const [templateRow]: any = await query(
            "SELECT content FROM smstemplates WHERE id = ?",
            [templateId]
          );

          const smsContent = templateRow?.[0]?.content
            ? templateRow[0].content.replace(/{client_name}/g, client_name)
            : `نوبت شما برای ${booking_date} ساعت ${booking_time} ثبت شد.`;

          await query(
            "UPDATE users SET sms_balance = sms_balance - 1 WHERE id = ?",
            [userId]
          );
          await query(
            "INSERT INTO smslog (user_id, booking_id, to_phone, template_id, content, cost) VALUES (?, ?, ?, ?, ?, 1)",
            [userId, bookingId, client_phone, templateId, smsContent]
          );
        } else {
          console.warn(
            `User ${userId} has insufficient SMS balance for reservation SMS.`
          );
        }
      }

      // 3. SMS یادآوری → توسط کرون جاب ارسال میشه (تنظیمات ذخیره شد)

      return NextResponse.json(
        {
          message: "Booking created successfully. SMS settings saved.",
          bookingId,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      return NextResponse.json(
        { message: "Failed to create booking" },
        { status: 500 }
      );
    }
  }

  // اگر متد دیگه‌ای بود
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
});

// Export صحیح برای Next.js 15
export { handler as GET, handler as POST };
