// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { query, QueryResult } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { deductSms, getTotalSmsBalance } from '@/lib/sms-utils';
// یک handler مشترک برای GET، POST، DELETE و PATCH
const handler = withAuth(async (req: NextRequest, context) => {
  const { userId } = context; // userId از withAuth تزریق شده

  // ------------------------------------------------------------------
  // GET: لیست نوبت‌ها
  // ------------------------------------------------------------------
  if (req.method === "GET") {
    try {
      // ابتدا نوبت‌های گذشته را به "انجام شده" تغییر وضعیت دهید
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
        services = "",
        sms_reserve_enabled = false,
        sms_reserve_custom_text = "",
        sms_reminder_enabled = false,
        sms_reminder_custom_text = "",
        sms_reminder_hours_before = 24,
      } = await req.json();

      console.log("📥 دریافت داده‌های نوبت:", {
        client_name,
        client_phone,
        booking_date,
        booking_time,
        userId,
      });

      // اعتبارسنجی فیلدهای ضروری
      if (!client_name || !client_phone || !booking_date || !booking_time) {
        return NextResponse.json(
          {
            message:
              "فیلدهای ضروری خالی هستند: نام مشتری، شماره تلفن، تاریخ، زمان",
          },
          { status: 400 }
        );
      }

      // بررسی اعتبارسنجی شماره تلفن
      const cleanedPhone = client_phone.replace(/\D/g, "");
      if (cleanedPhone.length < 10 || cleanedPhone.length > 12) {
        return NextResponse.json(
          {
            message: "فرمت شماره تلفن نامعتبر است (باید ۱۰ تا ۱۲ رقم باشد)",
          },
          { status: 400 }
        );
      }

      // بررسی تاریخ (نباید گذشته باشد)
      const currentDate = new Date().toISOString().split("T")[0];
      if (booking_date < currentDate) {
        return NextResponse.json(
          {
            message: "تاریخ نمی‌تواند در گذشته باشد",
          },
          { status: 400 }
        );
      }

      // بررسی مشتری موجود
      const [existingClient]: any = await query(
        "SELECT client_name FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, cleanedPhone]
      );

      // محاسبه تعداد پیامک‌های مورد نیاز
      const totalSmsNeeded =
        (sms_reserve_enabled ? 1 : 0) + (sms_reminder_enabled ? 1 : 0);

      // 
// بررسی موجودی SMS در صورت نیاز
if (totalSmsNeeded > 0) {
  // دریافت موجودی کل (پلن + بسته‌ها)
  const totalBalance = await getTotalSmsBalance(userId);
  
  if (totalBalance < totalSmsNeeded) {
    // برای نمایش دقیق‌تر موجودی‌ها
    const [balanceDetails]: any = await query(`
      SELECT 
        COALESCE(u.sms_balance, 0) AS plan_balance,
        COALESCE(SUM(sp.remaining_sms), 0) AS purchased_balance
      FROM users u
      LEFT JOIN smspurchase sp ON sp.user_id = u.id 
        AND sp.type = 'one_time_sms' 
        AND sp.status = 'active'
        AND (sp.expires_at IS NULL OR expires_at >= CURDATE())
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    return NextResponse.json(
      {
        message: `موجودی پیامک کافی نیست. برای ${totalSmsNeeded} پیامک نیاز دارید.`,
        details: {
          needed: totalSmsNeeded,
          plan_balance: balanceDetails?.plan_balance || 0,
          purchased_balance: balanceDetails?.purchased_balance || 0,
          total_balance: totalBalance
        }
      },
      { status: 402 }
    );
  }
}

      // 1. ثبت نوبت در دیتابیس
      const insertSql = `
        INSERT INTO booking 
        (user_id, client_name, client_phone, booking_date, booking_time, 
         booking_description, services,
         status, sms_reserve_enabled, sms_reserve_custom_text,
         sms_reminder_enabled, sms_reminder_custom_text, sms_reminder_hours_before) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
      `;

      const smsReserveEnabled = sms_reserve_enabled ? 1 : 0;
      const smsReminderEnabled = sms_reminder_enabled ? 1 : 0;

      console.log("🔄 در حال ثبت نوبت در دیتابیس...");

      const result = await query<QueryResult>(insertSql, [
        userId,
        client_name.trim(),
        cleanedPhone,
        booking_date,
        booking_time,
        booking_description.trim(),
        services.trim(),
        smsReserveEnabled,
        sms_reserve_custom_text.trim(),
        smsReminderEnabled,
        sms_reminder_custom_text.trim(),
        sms_reminder_hours_before,
      ]);

      const bookingId = result[0].insertId;
      console.log("✅ نوبت ثبت شد. ID:", bookingId);
      let smsLogsCreated = 0;

      // 2. به‌روزرسانی یا ایجاد مشتری در جدول clients
      try {
        console.log("🔄 در حال به‌روزرسانی جدول clients...");

        // کوئری INSERT با ON DUPLICATE KEY UPDATE
        const upsertClientSql = `
          INSERT INTO clients 
          (client_name, client_phone, user_id, last_booking_date, total_bookings, created_at) 
          VALUES (?, ?, ?, ?, 1, NOW())
          ON DUPLICATE KEY UPDATE 
          client_name = VALUES(client_name),
          last_booking_date = VALUES(last_booking_date),
          total_bookings = total_bookings + 1,
          updated_at = NOW()
        `;

        console.log("📝 اجرای کوئری clients:", {
          client_name: client_name.trim(),
          client_phone: cleanedPhone,
          userId,
          booking_date,
        });

        await query(upsertClientSql, [
          client_name.trim(),
          cleanedPhone,
          userId,
          booking_date,
        ]);

        console.log("✅ جدول clients به‌روزرسانی شد");
      } catch (clientError: unknown) {
        const error = clientError as { message?: string; code?: string; sqlState?: string; sqlMessage?: string };
        console.warn("⚠️ خطا در به‌روزرسانی جدول clients:", {
          message: error.message,
          code: error.code,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage,
        });
      }

      // 3. اگر مشتری موجود بود و نامش تغییر کرده، نوبت‌های آینده را به‌روزرسانی کن
      if (existingClient && existingClient.client_name && existingClient.client_name !== client_name.trim()) {
        console.log(`🔄 در حال به‌روزرسانی نام مشتری در نوبت‌های آینده از "${existingClient.client_name}" به "${client_name.trim()}"...`);
        
        try {
          // کوئری برای به‌روزرسانی نام مشتری در نوبت‌های آینده
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
          console.log("✅ نام مشتری در نوبت‌های آینده به‌روزرسانی شد");
        } catch (updateError: unknown) {
          const error = updateError as { message?: string };
          console.warn("⚠️ خطا در به‌روزرسانی نام مشتری:", error.message);
        }
      }

      // 4. ارسال SMS رزرو فوری (اگر فعال بود)
      if (sms_reserve_enabled) {
        // اعتبارسنجی متن پیام رزرو
        if (!sms_reserve_custom_text.trim()) {
          return NextResponse.json(
            { message: "متن پیام تأیید رزرو نمی‌تواند خالی باشد" },
            { status: 400 }
          );
        }

        if (sms_reserve_custom_text.trim().length < 10) {
          return NextResponse.json(
            { message: "متن پیام تأیید رزرو باید حداقل ۱۰ کاراکتر باشد" },
            { status: 400 }
          );
        }

        let smsContent = sms_reserve_custom_text.trim();

        // ثبت در لاگ SMS
        await query(
          "INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) VALUES (?, ?, ?, ?, 1, 'reservation')",
          [userId, bookingId, cleanedPhone, smsContent]
        );
        smsLogsCreated++;
        console.log("📱 پیامک رزرو ثبت شد");
      }

      // 5. SMS یادآوری (تنها ثبت در لاگ - ارسال بعدی توسط کرون جاب)
      if (sms_reminder_enabled) {
        // اعتبارسنجی متن پیام یادآوری
        if (!sms_reminder_custom_text.trim()) {
          return NextResponse.json(
            { message: "متن پیام یادآوری نمی‌تواند خالی باشد" },
            { status: 400 }
          );
        }

        if (sms_reminder_custom_text.trim().length < 10) {
          return NextResponse.json(
            { message: "متن پیام یادآوری باید حداقل ۱۰ کاراکتر باشد" },
            { status: 400 }
          );
        }

        let reminderContent = sms_reminder_custom_text.trim();

        // ثبت در لاگ SMS (یادآوری)
        await query(
          "INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) VALUES (?, ?, ?, ?, 1, 'reminder')",
          [userId, bookingId, cleanedPhone, reminderContent]
        );
        smsLogsCreated++;
        console.log("⏰ پیامک یادآوری ثبت شد");
      }

      // 6. کسر پیامک‌ها از موجودی کاربر (فقط یک بار)
if (totalSmsNeeded > 0) {
  const deductionResult = await deductSms(userId, totalSmsNeeded);
  if (!deductionResult) {
    console.error("❌ خطا در کسر پیامک‌ها");
    // در صورت خطا می‌توانید نوبت را کنسل کنید
  } else {
    console.log("✅ پیامک‌ها با موفقیت کسر شدند:", totalSmsNeeded);
  }
}

      return NextResponse.json(
        {
          message: "نوبت با موفقیت ثبت شد",
          bookingId,
          smsReserved: sms_reserve_enabled,
          smsReminder: sms_reminder_enabled,
          smsCount: totalSmsNeeded,
          smsLogsCreated,
          booking: {
            id: bookingId,
            client_name: client_name.trim(),
            client_phone: cleanedPhone,
            booking_date,
            booking_time,
            services,
            status: "active",
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      const err = error as { 
        message?: string; 
        code?: string; 
        sqlState?: string; 
        sqlMessage?: string;
        stack?: string;
      };
      
      console.error("❌ خطا در ثبت نوبت:", {
        message: err.message,
        code: err.code,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        stack: err.stack,
      });

      // بررسی خطاهای دیتابیس خاص
      if (err.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { message: "رکورد تکراری در سیستم وجود دارد" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: "خطا در ثبت نوبت",
          error: err.message,
          details: err.code || "خطای ناشناخته دیتابیس",
        },
        { status: 500 }
      );
    }
  }

  // ------------------------------------------------------------------
  // DELETE: حذف/کنسل نوبت
  // ------------------------------------------------------------------
  if (req.method === "DELETE") {
    try {
      const { id } = await req.json();
      
      if (!id) {
        return NextResponse.json(
          { message: "آی‌دی نوبت الزامی است" },
          { status: 400 }
        );
      }

      // بررسی اینکه نوبت متعلق به کاربر است
      const [booking]: any = await query(
        "SELECT id, status FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking) {
        return NextResponse.json(
          { message: "نوبت یافت نشد" },
          { status: 404 }
        );
      }

      // کنسل کردن نوبت
      await query(
        "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
        [id]
      );

      // ثبت در لاگ
      await query(
        "INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) VALUES (?, ?, '', 'کنسل شد', 1, 'other')",
        [userId, id]
      );

      return NextResponse.json({
        message: "نوبت با موفقیت کنسل شد",
        bookingId: id,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("❌ خطا در کنسل کردن نوبت:", err.message);
      return NextResponse.json(
        {
          message: "خطا در کنسل کردن نوبت",
          error: err.message,
        },
        { status: 500 }
      );
    }
  }

  // ------------------------------------------------------------------
  // PATCH: به‌روزرسانی نوبت
  // ------------------------------------------------------------------
  if (req.method === "PATCH") {
    try {
      const { id, ...updateData } = await req.json();
      
      if (!id) {
        return NextResponse.json(
          { message: "آی‌دی نوبت الزامی است" },
          { status: 400 }
        );
      }

      // بررسی اینکه نوبت متعلق به کاربر است
      const [booking]: any = await query(
        "SELECT id FROM booking WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (!booking) {
        return NextResponse.json(
          { message: "نوبت یافت نشد" },
          { status: 404 }
        );
      }

      // ساخت کوئری به‌روزرسانی پویا
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

      // اضافه کردن updated_at و id به values
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
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("❌ خطا در به‌روزرسانی نوبت:", err.message);
      return NextResponse.json(
        {
          message: "خطا در به‌روزرسانی نوبت",
          error: err.message,
        },
        { status: 500 }
      );
    }
  }

  // اگر متد دیگری بود
  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

// Export صحیح برای Next.js 15
export { handler as GET, handler as POST, handler as DELETE, handler as PATCH };