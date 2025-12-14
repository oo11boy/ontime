import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { deductSms, getSmsBalanceDetails } from '@/lib/sms-utils';

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const { appointmentIds, message } = await req.json();

    console.log("📨 Bulk SMS request:", { userId, appointmentIds, message });

    if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return NextResponse.json(
        { message: "لیست نوبت‌ها الزامی است" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { message: "متن پیام الزامی است" },
        { status: 400 }
      );
    }

    // بررسی موجودی کل پیامک (پلن + بسته‌ها)
    const balanceDetails = await getSmsBalanceDetails(userId);
    const smsNeeded = appointmentIds.length;

    console.log("💰 Balance check:", {
      needed: smsNeeded,
      planBalance: balanceDetails.plan_balance,
      purchasedBalance: balanceDetails.purchased_balance,
      totalBalance: balanceDetails.total_balance
    });

    if (balanceDetails.total_balance < smsNeeded) {
      return NextResponse.json(
        { 
          message: `موجودی پیامک کافی نیست. نیاز: ${smsNeeded}، موجودی کل: ${balanceDetails.total_balance}`,
          details: {
            needed: smsNeeded,
            plan_balance: balanceDetails.plan_balance,
            purchased_balance: balanceDetails.purchased_balance,
            total_balance: balanceDetails.total_balance
          },
          success: false
        },
        { status: 402 }
      );
    }

    // دریافت اطلاعات نوبت‌ها
    const placeholders = appointmentIds.map(() => '?').join(',');
    const appointments: any[] = await query(
      `SELECT id, client_name, client_phone FROM booking 
       WHERE id IN (${placeholders}) AND user_id = ? AND status = 'active'`,
      [...appointmentIds, userId]
    );

    console.log("✅ Found appointments:", appointments.length);

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { 
          message: "هیچ نوبت فعالی یافت نشد",
          success: false 
        },
        { status: 404 }
      );
    }

    // کسر پیامک‌ها از موجودی
    const deductionResult = await deductSms(userId, smsNeeded);
    
    if (!deductionResult) {
      return NextResponse.json(
        { 
          message: "خطا در کسر پیامک‌ها",
          success: false 
        },
        { status: 500 }
      );
    }

    const results = [];
    
    // ارسال پیام به هر مشتری
    for (const appointment of appointments) {
      console.log("📱 Processing appointment:", appointment.id);
      
      // اطمینان از وجود client_name
      if (!appointment.client_name) {
        console.warn("⚠️ No client_name for appointment:", appointment.id);
        continue;
      }
      
      // جایگزینی متغیر {client_name} با نام واقعی مشتری
      const personalizedMessage = message.replace(/{client_name}/g, appointment.client_name);
      
      // ثبت در لاگ SMS
      await query(
        "INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) VALUES (?, ?, ?, ?, 1, 'bulk')",
        [userId, appointment.id, appointment.client_phone, personalizedMessage]
      );
      
      results.push({
        appointmentId: appointment.id,
        phone: appointment.client_phone,
        clientName: appointment.client_name,
        sent: true
      });
    }

    // دریافت موجودی جدید
    const newBalanceDetails = await getSmsBalanceDetails(userId);

    console.log("✅ Bulk SMS completed:", {
      sentCount: results.length,
      smsNeeded,
      newBalance: newBalanceDetails.total_balance
    });

    return NextResponse.json({
      success: true,
      message: `پیام با موفقیت برای ${results.length} نفر ارسال شد`,
      count: results.length,
      results,
      newBalance: newBalanceDetails.total_balance,
      balanceDetails: newBalanceDetails
    });

  } catch (error: any) {
    console.error("❌ Error sending bulk SMS:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        message: "خطا در ارسال پیام همگانی",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        success: false
      },
      { status: 500 }
    );
  }
});