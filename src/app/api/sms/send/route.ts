// src/app/api/sms/send/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-utils";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;
  const body = await req.json();
  const { to_phone, content, sms_type = "other", booking_id = null } = body;

  if (!to_phone || !content?.trim()) {
    return NextResponse.json({ success: false, message: "اطلاعات ناقص" }, { status: 400 });
  }

  // چک موجودی
  const balance = await getSmsBalanceDetails(userId);
  if (balance.total_balance < 1) {
    return NextResponse.json({ success: false, message: "موجودی کافی نیست" }, { status: 402 });
  }

  // کسر موجودی
  const deducted = await deductSms(userId, 1);
  if (!deducted) {
    return NextResponse.json({ success: false, message: "خطا در کسر موجودی" }, { status: 500 });
  }

  // ثبت در لاگ
  await query(
    `INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type, created_at)
     VALUES (?, ?, ?, ?, 1, ?, NOW())`,
    [userId, booking_id, to_phone, content.trim(), sms_type]
  );

  const newBalance = await getSmsBalanceDetails(userId);

  return NextResponse.json({
    success: true,
    message: "پیامک ارسال شد",
    newBalance: newBalance.total_balance,
  });
});