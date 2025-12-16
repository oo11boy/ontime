// File Path: src/app/api/bulk-sms/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { deductSms, getSmsBalanceDetails } from '@/lib/sms-utils';

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const { appointmentIds, clientIds, message } = await req.json();

    // حداقل یکی از لیست‌ها باید باشد
    if ((!appointmentIds?.length && !clientIds?.length) || !message?.trim()) {
      return NextResponse.json({ message: "داده‌های ورودی نامعتبر", success: false }, { status: 400 });
    }

    const smsNeeded = (appointmentIds?.length || 0) + (clientIds?.length || 0);

    // چک موجودی
    const balanceDetails = await getSmsBalanceDetails(userId);
    if (balanceDetails.total_balance < smsNeeded) {
      return NextResponse.json({ message: "موجودی کافی نیست", success: false }, { status: 402 });
    }

    let targets: any[] = [];
    let smsType = 'bulk';

    // حالت ۱: ارسال به نوبت‌ها (booking)
    if (appointmentIds?.length) {
      const placeholders = appointmentIds.map(() => '?').join(',');
      targets = await query(
        `SELECT id AS targetId, client_name AS name, client_phone AS phone 
         FROM booking 
         WHERE id IN (${placeholders}) AND user_id = ? AND status = 'active'`,
        [...appointmentIds, userId]
      );
      smsType = 'bulk_appointments';
    } 
    // حالت ۲: ارسال به مشتریان مستقیم (clients)
    else if (clientIds?.length) {
      const placeholders = clientIds.map(() => '?').join(',');
      targets = await query(
        `SELECT id AS targetId, client_name AS name, client_phone AS phone 
         FROM clients 
         WHERE id IN (${placeholders}) AND user_id = ? AND is_blocked = 0`,
        [...clientIds, userId]
      );
      smsType = 'bulk_customers';
    }

    if (!targets.length) {
      return NextResponse.json({ message: "هیچ مشتری/نوبت فعالی یافت نشد", success: false }, { status: 404 });
    }

    // کسر پیامک‌ها
    const deductionResult = await deductSms(userId, smsNeeded);
    if (!deductionResult) {
      return NextResponse.json({ message: "خطا در کسر موجودی پیامک", success: false }, { status: 500 });
    }

    const results: any[] = [];

    for (const target of targets) {
      // جایگزینی {client_name}
      const name = target.name || "مشتری عزیز";
      const personalizedMessage = message.replace(/{client_name}/g, name);

      // booking_id فقط برای نوبت‌ها
      const bookingId = smsType === 'bulk_appointments' ? target.targetId : null;

      // ثبت در smslog (ستون‌ها دقیقاً با دیتابیس تو مطابقت داره)
      await query(
        `INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, bookingId, target.phone, personalizedMessage, 1, smsType]
      );

      results.push({
        targetId: target.targetId,
        phone: target.phone,
        name: name,
        sent: true
      });
    }

    // موجودی جدید
    const newBalanceDetails = await getSmsBalanceDetails(userId);

    return NextResponse.json({
      success: true,
      message: `پیام با موفقیت برای ${results.length} نفر ارسال شد`,
      count: results.length,
      results,
      newBalance: newBalanceDetails.total_balance
    });

  } catch (error: any) {
    console.error("❌ Bulk SMS Error:", error.message);
    console.error("Error details:", error);
    return NextResponse.json({ 
      message: "خطای سرور در ارسال پیام",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      success: false 
    }, { status: 500 });
  }
});