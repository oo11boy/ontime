// src/app/api/sms/send/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import {
  deductSms,
  getSmsBalanceDetails,
  checkSmsBalance,
} from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";
import { cookies } from "next/headers";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  const cookieStore = await cookies();
  const staffIdFromCookie = cookieStore.get("staff_id")?.value;
  const staffId = staffIdFromCookie ? parseInt(staffIdFromCookie) : null;

  try {
    const body = await req.json();
    const {
      to_phone,
      content = "",
      sms_type = "other",
      booking_id = null,
      booking_date = null,
      booking_time = null,
      sms_reminder_hours_before = 24,
      template_key = null,
      message_count = 1,
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
      staffId,
      booking_date,
      booking_time,
      sms_reminder_hours_before,
    });

    if (!to_phone || to_phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل معتبر الزامی است" },
        { status: 400 },
      );
    }

    const users: any = await query(
      "SELECT business_name, name FROM users WHERE id = ?",
      [userId],
    );
    const userData = Array.isArray(users) ? users[0] : users;
    const salonName =
      userData?.business_name?.trim() || userData?.name?.trim() || "آن‌تایم";

    const finalSmsCost = Math.max(1, Number(message_count));

    const balanceCheck = await checkSmsBalance(userId, finalSmsCost, staffId);
    if (!balanceCheck.hasEnough) {
      return NextResponse.json(
        { success: false, message: balanceCheck.message },
        { status: 402 },
      );
    }

    let deducted = false;
    try {
      deducted = await deductSms(userId, finalSmsCost, staffId);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || "خطا در کسر موجودی پنل پیامک",
        },
        { status: 500 },
      );
    }

    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی پنل پیامک" },
        { status: 500 },
      );
    }

    // محاسبه زمان دقیق ارسال برای پیامک یادآوری
    let scheduledAt: Date | null = null;
    let delay = 0;

    if (
      sms_type === "reminder" &&
      booking_date &&
      booking_time &&
      sms_reminder_hours_before
    ) {
      const bookingDateTime = new Date(`${booking_date}T${booking_time}:00`);
      const sendTime = new Date(
        bookingDateTime.getTime() - sms_reminder_hours_before * 60 * 60 * 1000,
      );
      const now = new Date();

      if (sendTime > now) {
        scheduledAt = sendTime;
        delay = sendTime.getTime() - now.getTime();
      } else {
        scheduledAt = now;
        delay = 0;
      }

      console.log(
        `⏰ یادآوری برنامه‌ریزی شد: نوبت ${booking_date} ${booking_time}، ارسال در ${scheduledAt.toISOString()} (${sms_reminder_hours_before} ساعت قبل)`,
      );
    }

    const bookingAt =
      booking_date && booking_time
        ? `${booking_date} ${booking_time}:00`
        : null;

    const logResult: any = await query(
      `INSERT INTO smslog (
        user_id, staff_id, booking_id, booking_date, booking_time, reminder_hours_before,
        scheduled_at, to_phone, content, cost, sms_type, booking_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        userId,
        staffId,
        booking_id,
        booking_date,
        booking_time,
        sms_reminder_hours_before,
        scheduledAt,
        to_phone,
        content || `Pattern: ${template_key || "نامشخص"}`,
        finalSmsCost,
        sms_type,
        bookingAt,
      ],
    );

    const logId = logResult?.insertId || logResult?.[0]?.insertId;

    try {
      await smsQueue.add(
        "send-sms",
        {
          logId,
          to_phone,
          content: content || null,
          template_key,
          params: {
            name: name || "مشتری عزیز",
            date: customDate || booking_date || "",
            time: customTime || booking_time || "",
            service: service || "خدمات",
            link: link || "",
            salon: salonName,
          },
          userId,
          staffId,
          cost: finalSmsCost,
          scheduled_at: scheduledAt,
        },
        {
          delay: delay > 0 ? delay : undefined,
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    } catch (queueError) {
      console.error("[SMS API] خطا در افزودن به صف ارسال:", queueError);
      await query(
        "UPDATE smslog SET status = 'failed', error_message = 'Queue Error' WHERE id = ?",
        [logId],
      );
    }

    return NextResponse.json({
      success: true,
      deducted: finalSmsCost,
      scheduled_at: scheduledAt,
      message:
        delay > 0
          ? `یادآوری نوبت برای ${new Date(scheduledAt!).toLocaleString("fa-IR")} برنامه‌ریزی شد (${finalSmsCost} پیامک کسر شد)`
          : `پیامک با موفقیت در صف ارسال قرار گرفت (${finalSmsCost} پیامک کسر شد)`,
      logId,
    });
  } catch (error: any) {
    console.error("[SMS API] خطای بحرانی:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "خطای داخلی سرور در پردازش پیامک",
      },
      { status: 500 },
    );
  }
});
