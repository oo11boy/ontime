// File Path: src/app/api/sms/bulk/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { recipients, message, sms_type = "bulk_customers" } = body;

    // ۱. اعتبارسنجی
    if (!recipients?.length || !message?.trim()) {
      return NextResponse.json({ success: false, message: "داده‌ها ناقص است" }, { status: 400 });
    }

    // ۲. بررسی و کسر موجودی به صورت یکجا
    const count = recipients.length;
    const balance = await getSmsBalanceDetails(userId);
    
    if (balance.total_balance < count) {
      return NextResponse.json({ success: false, message: "موجودی کافی نیست" }, { status: 402 });
    }

    const deducted = await deductSms(userId, count);
    if (!deducted) throw new Error("Deduction failed");

    // ۳. پردازش و اضافه کردن به صف
    // برای سرعت بیشتر، همزمان هم در دیتابیس ثبت می‌کنیم و هم به صف می‌فرستیم
    const promises = recipients.map(async (recipient: any) => {
      const personalized = message.replace(/{client_name}/g, recipient.name || "مشتری");
      
      // الف) ثبت لاگ اولیه
      const logResult: any = await query(
        `INSERT INTO smslog (user_id, to_phone, content, cost, sms_type, status, created_at)
         VALUES (?, ?, ?, 1, ?, 'pending', NOW())`,
        [userId, recipient.phone, personalized, sms_type]
      );
      
      const logId = logResult.insertId || logResult[0]?.insertId;

      // ب) اضافه کردن به صف BullMQ برای ارسال واقعی توسط پنل
      if (logId) {
        return smsQueue.add("send-sms", {
          logId,
          to_phone: recipient.phone,
          content: personalized,
          template_key: null, // پیام همگانی معمولاً بدون الگو و Normal ارسال می‌شود
        });
      }
    });

    await Promise.all(promises);

    const newBalance = await getSmsBalanceDetails(userId);
    return NextResponse.json({
      success: true,
      message: `ارسال گروهی به ${count} نفر با موفقیت شروع شد.`,
      newBalance: newBalance.total_balance,
    });

  } catch (error: any) {
    console.error("Bulk SMS Error:", error);
    return NextResponse.json({ success: false, message: "خطا در سرور" }, { status: 500 });
  }
});