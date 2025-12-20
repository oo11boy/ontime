// src/app/api/sms/bulk/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-utils";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;
  const body = await req.json();
  const { recipients, message, sms_type = "bulk" } = body;

  if (!recipients?.length || !message?.trim()) {
    return NextResponse.json({ success: false, message: "اطلاعات ناقص" }, { status: 400 });
  }

  const count = recipients.length;

  // چک موجودی
  const balance = await getSmsBalanceDetails(userId);
  if (balance.total_balance < count) {
    return NextResponse.json({ success: false, message: "موجودی کافی نیست" }, { status: 402 });
  }

  // کسر موجودی
  const deducted = await deductSms(userId, count);
  if (!deducted) {
    return NextResponse.json({ success: false, message: "خطا در کسر موجودی" }, { status: 500 });
  }

  // ثبت لاگ‌ها
  for (const { phone, booking_id = null, name = "" } of recipients) {
    const personalized = message.replace(/{client_name}/g, name || "مشتری");
    await query(
      `INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type, created_at)
       VALUES (?, ?, ?, ?, 1, ?, NOW())`,
      [userId, booking_id, phone, personalized, sms_type]
    );
  }

  const newBalance = await getSmsBalanceDetails(userId);

  return NextResponse.json({
    success: true,
    message: `پیامک برای ${count} نفر ارسال شد`,
    newBalance: newBalance.total_balance,
  });
});