// File Path: src/app/api/sms/send/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      to_phone,
      content,
      sms_type = "other",
      booking_id = null,
      booking_date = null,
      booking_time = null,
      sms_reminder_hours_before = 24,
      use_template = false,
      template_key = null, // دریافت کد پترن داینامیک از کلاینت
    } = body;

    console.log(`[SMS API] درخواست ارسال پیامک (${sms_type}):`, {
      to_phone,
      template_key,
    });

    // ۱. اعتبارسنجی داده‌های پایه
    if (!to_phone || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل و متن پیام الزامی است" },
        { status: 400 }
      );
    }

    // ۲. بررسی موجودی پنل پیامک کاربر
    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < 1) {
      return NextResponse.json(
        { success: false, message: "موجودی پیامک کافی نیست" },
        { status: 402 }
      );
    }

    // ۳. کسر موجودی از دیتابیس داخلی
    const deducted = await deductSms(userId, 1);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی حساب" },
        { status: 500 }
      );
    }

    // ۴. محاسبه زمان ارسال (برای یادآوری‌ها)
    let delay = 0;
    if (sms_type === "reminder" && booking_date && booking_time) {
      const hoursBefore = Number(sms_reminder_hours_before) || 24;
      const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
      const sendTime = new Date(
        bookingDateTime.getTime() - hoursBefore * 60 * 60 * 1000
      );
      delay = Math.max(0, sendTime.getTime() - Date.now());
    }

    // ۵. تعیین کد پترن نهایی (اولویت با مقدار ارسالی از فرانت است)
    let finalTemplateKey = template_key;
    if (use_template && !finalTemplateKey) {
      // مقادیر Fallback در صورتی که دیتابیس هنوز تنظیم نشده باشد
      finalTemplateKey =
        sms_type === "reservation" ? "gyx3qp1fh9r0y5w" : "cl6lfpotqzrcusk";
    }

    const bookingAt =
      booking_date && booking_time
        ? `${booking_date} ${booking_time}:00`
        : null;

    // ۶. ثبت لاگ در جدول smslog (برای پیگیری وضعیت ارسال)
    let logId: number | null = null;
    try {
      const logResult: any = await query(
        `INSERT INTO smslog (
          user_id, booking_id, to_phone, content, cost, sms_type, booking_at, status, created_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?, 'pending', NOW())`,
        [userId, booking_id, to_phone, content.trim(), sms_type, bookingAt]
      );

      // استخراج Insert ID بر اساس پکیج mysql2/mariadb
      logId = logResult?.insertId || logResult?.[0]?.insertId;

      if (!logId) throw new Error("Could not retrieve log ID");
    } catch (dbError) {
      console.error("[SMS API] Error inserting into smslog:", dbError);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت لاگ پیامک" },
        { status: 500 }
      );
    }

    // ۷. اضافه کردن به صف BullMQ جهت پردازش توسط Worker
    try {
      await smsQueue.add(
        "send-sms",
        {
          logId,
          to_phone,
          content: content.trim(),
          template_key: finalTemplateKey, // انتقال کلید داینامیک به صف
        },
        {
          delay: delay > 0 ? delay : undefined,
          attempts: 5,
          backoff: { type: "exponential", delay: 5000 },
        }
      );
    } catch (queueError) {
      console.error("[SMS API] Queue Error:", queueError);
      // توجه: چون نوبت ثبت شده و موجودی کسر شده، اینجا موفقیت برمی‌گردانیم اما لاگ خطا می‌زنیم
    }

    return NextResponse.json({
      success: true,
      message:
        delay > 0 ? "یادآوری نوبت زمان‌بندی شد" : "پیامک در صف ارسال قرار گرفت",
    });
  } catch (error: any) {
    console.error("[SMS API] Global Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
});
