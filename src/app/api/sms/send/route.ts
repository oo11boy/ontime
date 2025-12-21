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
      use_template = false,
    } = body;

    console.log("[SMS API] درخواست دریافت شد:", {
      to_phone,
      sms_type,
      use_template,
      booking_id,
    });

    if (!to_phone || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل و متن پیام الزامی است" },
        { status: 400 }
      );
    }

    const balance = await getSmsBalanceDetails(userId);
    console.log("[SMS API] موجودی کاربر:", balance.total_balance);

    if (balance.total_balance < 1) {
      return NextResponse.json(
        { success: false, message: "موجودی پیامک کافی نیست" },
        { status: 402 }
      );
    }

    const deducted = await deductSms(userId, 1);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی" },
        { status: 500 }
      );
    }

    let delay = 0;
    let template_key: string | null = null;

    if (sms_type === "reminder" && booking_date && booking_time) {
      const hoursBefore = Number(sms_reminder_hours_before) || 24;
      const sendTime = new Date(`${booking_date}T${booking_time}:00`);
      sendTime.setHours(sendTime.getHours() - hoursBefore);
      delay = Math.max(0, sendTime.getTime() - Date.now());
    }

    if (use_template) {
      template_key = sms_type === "reservation" ? "100" : "101";
    }

    const bookingAt =
      booking_date && booking_time
        ? `${booking_date} ${booking_time}:00`
        : null;

    // ثبت لاگ — با تایپ صحیح برای insertId
    let logId: number | null = null;
    try {
      // استفاده از any برای دور زدن تایپ سختگیرانه TypeScript
      const logResult: any = await query(
        `INSERT INTO smslog (
          user_id, 
          booking_id, 
          to_phone, 
          content, 
          cost, 
          sms_type, 
          booking_at, 
          status, 
          created_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?, 'pending', NOW())`,
        [
          userId,
          booking_id || null,
          to_phone,
          content.trim(),
          sms_type,
          bookingAt,
        ]
      );

      // مدیریت همه حالات ممکن برای insertId
      if (logResult && typeof logResult === "object") {
        if (Array.isArray(logResult) && logResult[0]?.insertId) {
          logId = logResult[0].insertId;
        } else if ("insertId" in logResult) {
          logId = logResult.insertId;
        }
      }

      if (!logId || logId === 0) {
        console.error(
          "[SMS API] insertId معتبر نیست — نتیجه کوئری:",
          logResult
        );
        return NextResponse.json(
          { success: false, message: "خطا در دریافت ID لاگ پیامک" },
          { status: 500 }
        );
      }

      console.log("[SMS API] لاگ پیامک با موفقیت ثبت شد — logId:", logId);
    } catch (dbError: any) {
      console.error("[SMS API] خطا در INSERT smslog:", dbError);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت لاگ پیامک" },
        { status: 500 }
      );
    }

    // اضافه کردن جاب به صف
    try {
      await smsQueue.add(
        "send-sms",
        {
          logId,
          to_phone,
          content: content.trim(),
          template_key,
        },
        {
          delay: delay > 0 ? delay : undefined,
          attempts: 5,
          backoff: { type: "exponential", delay: 5000 },
        }
      );

      console.log("[SMS API] جاب با موفقیت به صف اضافه شد — logId:", logId);
    } catch (queueError: any) {
      console.error("[SMS API] خطا در اضافه کردن جاب:", queueError);
    }

    return NextResponse.json({
      success: true,
      message:
        delay > 0
          ? "یادآوری با موفقیت زمان‌بندی شد"
          : "پیامک تأیید در صف ارسال قرار گرفت",
    });
  } catch (error: any) {
    console.error("[SMS API] خطای کلی:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
});
