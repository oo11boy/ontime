import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const { appointmentIds, message } = await req.json();

    console.log("Bulk SMS request:", { userId, appointmentIds, message });

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

    // بررسی موجودی پیامک کاربر
    const [userRow]: any = await query(
      "SELECT sms_balance FROM users WHERE id = ?",
      [userId]
    );

    if (!userRow) {
      return NextResponse.json(
        { message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    if (userRow.sms_balance < appointmentIds.length) {
      return NextResponse.json(
        { 
          message: `موجودی پیامک کافی نیست. نیاز: ${appointmentIds.length}، موجودی: ${userRow.sms_balance}`,
          required: appointmentIds.length,
          available: userRow.sms_balance
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

    console.log("Found appointments:", appointments);

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { message: "هیچ نوبت فعالی یافت نشد" },
        { status: 404 }
      );
    }

    const results = [];
    
    // ارسال پیام به هر مشتری
    for (const appointment of appointments) {
      console.log("Processing appointment:", appointment);
      
      // اطمینان از وجود client_name
      if (!appointment.client_name) {
        console.warn("No client_name for appointment:", appointment.id);
        continue;
      }
      
      // جایگزینی متغیر {client_name} با نام واقعی مشتری
      const personalizedMessage = message.replace(/{client_name}/g, appointment.client_name);
      
      // ثبت در لاگ SMS
      await query(
        "INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type) VALUES (?, ?, ?, ?, 1, 'other')",
        [userId, appointment.id, appointment.client_phone, personalizedMessage]
      );
      
      results.push({
        appointmentId: appointment.id,
        phone: appointment.client_phone,
        clientName: appointment.client_name,
        sent: true
      });
    }

    // کسر پیامک‌ها از موجودی کاربر
    await query(
      "UPDATE users SET sms_balance = sms_balance - ? WHERE id = ?",
      [appointments.length, userId]
    );

    // دریافت موجودی جدید
    const [updatedUser]: any = await query(
      "SELECT sms_balance FROM users WHERE id = ?",
      [userId]
    );

    console.log("Bulk SMS completed:", {
      sentCount: appointments.length,
      newBalance: updatedUser?.sms_balance || 0
    });

    return NextResponse.json({
      success: true,
      message: `پیام با موفقیت برای ${appointments.length} نفر ارسال شد`,
      count: appointments.length,
      results,
      newBalance: updatedUser?.sms_balance || 0
    });

  } catch (error: any) {
    console.error("Error sending bulk SMS:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        message: "خطا در ارسال پیام همگانی",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
});