// src/app/api/customer/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, slug, code } = await req.json();
    
    if (!name || !phone || !slug || !code) {
      return NextResponse.json({ success: false, message: "اطلاعات ناقص است" }, { status: 400 });
    }

    const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
    
    const otpRecords = await query(
      `SELECT * FROM booking_otp 
       WHERE phone = ? AND slug = ? AND otp_code = ? AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [cleanedPhone, slug, code]
    );
    
    if (otpRecords.length === 0) {
      return NextResponse.json({ success: false, message: "کد نامعتبر یا منقضی شده" }, { status: 400 });
    }
    
    // ایجاد یا به‌روزرسانی حساب مشتری
    await query(
      `INSERT INTO customer_accounts (phone, name, slug, last_login, created_at)
       VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), last_login = NOW()`,
      [cleanedPhone, name, slug]
    );
    
    // حذف OTP استفاده شده
    await query(`DELETE FROM booking_otp WHERE phone = ? AND slug = ?`, [cleanedPhone, slug]);
    
    // تولید توکن ساده
    const token = Buffer.from(`${cleanedPhone}:${Date.now()}`).toString("base64");
    
    return NextResponse.json({
      success: true,
      message: "ورود با موفقیت انجام شد",
      customer: { name, phone: cleanedPhone, token },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ success: false, message: "خطا در تأیید کد" }, { status: 500 });
  }
}