// src/app/api/customer/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, slug } = await req.json();
    
    if (!name || !phone || !slug) {
      return NextResponse.json({ success: false, message: "اطلاعات ناقص است" }, { status: 400 });
    }

    const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
    
    // فعلاً کد ثابت ۱۲۳۴۵۶ برای تست (بعداً با ارسال پیامک واقعی جایگزین می‌شود)
    const fakeOtp = "123456";
    
    // ذخیره OTP در دیتابیس
    await query(
      `INSERT INTO booking_otp (phone, name, slug, otp_code, expires_at, created_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), NOW())
       ON DUPLICATE KEY UPDATE 
       otp_code = VALUES(otp_code), 
       expires_at = VALUES(expires_at),
       created_at = NOW()`,
      [cleanedPhone, name, slug, fakeOtp]
    );
    
    // TODO: در آینده ارسال پیامک واقعی با کد
    console.log(`کد تأیید برای ${cleanedPhone}: ${fakeOtp}`);
    
    return NextResponse.json({
      success: true,
      message: "کد تأیید برای شما ارسال شد (فعلاً ۱۲۳۴۵۶)",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ success: false, message: "خطا در ارسال کد" }, { status: 500 });
  }
}