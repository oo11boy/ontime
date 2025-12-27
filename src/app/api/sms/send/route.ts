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
      sms_type = "other", // مقادیر: reservation, reminder, other
      booking_id = null,
      booking_date = null,
      booking_time = null,
      sms_reminder_hours_before = 24,
      template_key = null,
      name,
      date,
      time,
      service,
      link,
    } = body;

    console.log(`[SMS API] درخواست ارسال پیامک (${sms_type}):`, { to_phone });

    // ۱. اعتبارسنجی داده‌های پایه
    if (!to_phone) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل الزامی است" },
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

    // ۴. محاسبه زمان ارسال (Delay) برای یادآوری‌ها
    let delay = 0;
    if (sms_type === "reminder" && booking_date && booking_time) {
      const hoursBefore = Number(sms_reminder_hours_before) || 24;
      const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
      const sendTime = new Date(
        bookingDateTime.getTime() - hoursBefore * 60 * 60 * 1000
      );
      delay = Math.max(0, sendTime.getTime() - Date.now());
    }

    // ۵. تعیین هوشمند کد پترن (Today / Tomorrow)
    let finalTemplateKey = template_key;

    if (!finalTemplateKey) {
      try {
        if (sms_type === "reminder") {
          // اگر زمان یادآوری کمتر از ۲۴ ساعت باشد از پترن today استفاده کن
          const hoursBefore = Number(sms_reminder_hours_before) || 24;
          const targetSubType = hoursBefore >= 24 ? "tomorrow" : "today";

          const [tpl]: any = await query(
            "SELECT payamresan_id FROM smstemplates WHERE type = 'reminder' AND sub_type = ? LIMIT 1",
            [targetSubType]
          );
          finalTemplateKey = tpl?.payamresan_id;
        } else if (sms_type === "reservation") {
          const [tpl]: any = await query(
            "SELECT payamresan_id FROM smstemplates WHERE type = 'reserve' LIMIT 1"
          );
          finalTemplateKey = tpl?.payamresan_id;
        }
      } catch (dbErr) {
        console.error("[SMS API] Error fetching template from DB:", dbErr);
      }
    }

    // Fallback نهایی اگر پترنی در دیتابیس یافت نشد
    if (!finalTemplateKey) {
      finalTemplateKey =
        sms_type === "reservation" ? "j72j4sspgse7vql" : "cl6lfpotqzrcusk";
    }

    const bookingAt =
      booking_date && booking_time
        ? `${booking_date} ${booking_time}:00`
        : null;

    // ۶. ثبت لاگ در جدول smslog
    let logId: number | null = null;
    const logResult: any = await query(
      `INSERT INTO smslog (
        user_id, booking_id, to_phone, content, cost, sms_type, booking_at, status, created_at
      ) VALUES (?, ?, ?, ?, 1, ?, ?, 'pending', NOW())`,
      [
        userId,
        booking_id,
        to_phone,
        content?.trim() || `Pattern: ${finalTemplateKey}`,
        sms_type,
        bookingAt,
      ]
    );

    logId = logResult?.insertId || logResult?.[0]?.insertId;

    // ۷. اضافه کردن به صف BullMQ جهت ارسال توسط Worker
    try {
      await smsQueue.add(
        "send-sms",
        {
          logId,
          to_phone,
          content: content?.trim() || "",
          template_key: finalTemplateKey,
          params: {
            name: name || "مشتری",
            date: date || "",
            time: time || "",
            service: service || "خدمات",
            link: link || "",
          },
        },
        {
          delay: delay > 0 ? delay : undefined,
          attempts: 5,
          backoff: { type: "exponential", delay: 5000 },
        }
      );
    } catch (queueError) {
      console.error("[SMS API] Queue Error:", queueError);
      // در صورت خطا در صف، وضعیت لاگ را آپدیت می‌کنیم
      await query(
        "UPDATE smslog SET status = 'failed', error_message = 'Queue Error' WHERE id = ?",
        [logId]
      );
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
