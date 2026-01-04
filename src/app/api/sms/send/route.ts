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
      content,
      sms_type = "other",
      booking_id = null,
      booking_date = null,
      booking_time = null,
      sms_reminder_hours_before = 24,
      template_key = null,
      name,
      date: customDate, // ممکن است از جای دیگر بیاید
      time: customTime, // ممکن است از جای دیگر بیاید
      service,
      link,
    } = body;

    console.log(`[SMS API] درخواست ارسال پیامک (${sms_type}):`, { to_phone });

    if (!to_phone) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل الزامی است" },
        { status: 400 }
      );
    }

    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < 1) {
      return NextResponse.json(
        { success: false, message: "موجودی پیامک کافی نیست" },
        { status: 402 }
      );
    }

    const deducted = await deductSms(userId, 1);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی حساب" },
        { status: 500 }
      );
    }

    const users: any = await query(
      "SELECT business_name, name FROM users WHERE id = ?",
      [userId]
    );
    const userData = Array.isArray(users) ? users[0] : users;
    const salonName =
      userData?.business_name?.trim() || userData?.name?.trim() || "آن‌تایم";

    let delay = 0;
    if (sms_type === "reminder" && booking_date && booking_time) {
      const hoursBefore = Number(sms_reminder_hours_before) || 24;
      const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
      const sendTime = new Date(
        bookingDateTime.getTime() - hoursBefore * 60 * 60 * 1000
      );
      delay = Math.max(0, sendTime.getTime() - Date.now());
    }

    let finalTemplateKey = template_key;

    if (!finalTemplateKey) {
      try {
        if (sms_type === "reminder") {
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

    if (!finalTemplateKey) {
      finalTemplateKey =
        sms_type === "reservation" ? "j72j4sspgse7vql" : "cl6lfpotqzrcusk";
    }

    const bookingAt =
      booking_date && booking_time
        ? `${booking_date} ${booking_time}:00`
        : null;

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
            // اولویت: اگر customDate/time آمد (از فرانت)، استفاده کن، وگرنه از booking_date/time
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
        }
      );
    } catch (queueError) {
      console.error("[SMS API] Queue Error:", queueError);
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
