// src/app/api/sms/send/route.ts
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
      content = "", // فقط برای لاگ‌گیری (در صف ارسال استفاده نمی‌شه)
      sms_type = "other",
      booking_id = null,
      booking_date = null,
      booking_time = null,
      sms_reminder_hours_before = 24,
      template_key = null,
      message_count = 1, // ← این عدد مستقیماً از دیتابیس (smstemplates.message_count) می‌آید
      name,
      date: customDate,
      time: customTime,
      service,
      link,
    } = body;

    console.log(`[SMS API] درخواست ارسال پیامک (${sms_type}):`, {
      to_phone,
      template_key,
      message_count,
      booking_id,
    });

    // اعتبارسنجی شماره موبایل
    if (!to_phone || to_phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل معتبر الزامی است" },
        { status: 400 }
      );
    }

    // دریافت نام سالن برای جایگزینی %salon%
    const users: any = await query(
      "SELECT business_name, name FROM users WHERE id = ?",
      [userId]
    );
    const userData = Array.isArray(users) ? users[0] : users;
    const salonName =
      userData?.business_name?.trim() || userData?.name?.trim() || "آن‌تایم";

    // تعیین هزینه نهایی — دقیقاً بر اساس message_count از دیتابیس
    const finalSmsCost = Math.max(1, Number(message_count));

    // بررسی موجودی
    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < finalSmsCost) {
      return NextResponse.json(
        {
          success: false,
          message: `موجودی پیامک کافی نیست — نیاز: ${finalSmsCost} پیامک، موجود: ${balance.total_balance} پیامک`,
        },
        { status: 402 }
      );
    }

    // کسر موجودی بر اساس message_count دیتابیس
    const deducted = await deductSms(userId, finalSmsCost);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی پنل پیامک" },
        { status: 500 }
      );
    }

    // محاسبه تأخیر برای یادآوری
    let delay = 0;
    if (sms_type === "reminder" && booking_date && booking_time) {
      const hoursBefore = Number(sms_reminder_hours_before) || 24;
      const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
      const sendTime = new Date(
        bookingDateTime.getTime() - hoursBefore * 60 * 60 * 1000
      );
      delay = Math.max(0, sendTime.getTime() - Date.now());
    }

    const bookingAt =
      booking_date && booking_time ? `${booking_date} ${booking_time}:00` : null;

    // ثبت در smslog با هزینه دقیق (از message_count)
    const logResult: any = await query(
      `INSERT INTO smslog (
        user_id, booking_id, to_phone, content, cost, sms_type, booking_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        userId,
        booking_id,
        to_phone,
        content || `Pattern: ${template_key || "نامشخص"}`,
        finalSmsCost,
        sms_type,
        bookingAt,
      ]
    );

    const logId = logResult?.insertId || logResult?.[0]?.insertId;

    // افزودن به صف ارسال (محتوای واقعی در worker جایگزین می‌شه، فقط پترن و پارامترها مهمن)
    try {
      await smsQueue.add(
        "send-sms",
        {
          logId,
          to_phone,
          content: content || null, // اگر محتوا خام بود، استفاده می‌شه، وگرنه از پترن
          template_key,
          params: {
            name: name || "مشتری عزیز",
            date: customDate || booking_date || "",
            time: customTime || booking_time || "",
            service: service || "خدمات",
            link: link || "",
            salon: salonName,
          },
        },
        {
          delay: delay > 0 ? delay : undefined,
          attempts: 5,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    } catch (queueError) {
      console.error("[SMS API] خطا در افزودن به صف ارسال:", queueError);
      await query(
        "UPDATE smslog SET status = 'failed', error_message = 'Queue Error' WHERE id = ?",
        [logId]
      );
    }

    // پاسخ نهایی
    return NextResponse.json({
      success: true,
      deducted: finalSmsCost,
      message:
        delay > 0
          ? `یادآوری نوبت با موفقیت زمان‌بندی شد (${finalSmsCost} پیامک کسر شد)`
          : `پیامک با موفقیت در صف ارسال قرار گرفت (${finalSmsCost} پیامک کسر شد)`,
      logId,
    });
  } catch (error: any) {
    console.error("[SMS API] خطای بحرانی:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور در پردازش پیامک" },
      { status: 500 }
    );
  }
});