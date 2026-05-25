// src/app/api/customer/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

async function sendSms(phone: string, code: string) {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER = process.env.SENDER_NUMBER;
  const PATTERN_CODE = "c08amdu58d226ss"; // الگوی ارسال کد تأیید

  // تبدیل شماره به فرمت بین‌المللی
  let formattedPhone = phone;
  if (phone.startsWith("0")) {
    formattedPhone = `+98${phone.slice(1)}`;
  } else if (phone.startsWith("98")) {
    formattedPhone = `+${phone}`;
  } else if (!phone.startsWith("+")) {
    formattedPhone = `+98${phone}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER,
        code: PATTERN_CODE,
        recipients: [formattedPhone],
        params: { code },
      }),
    });
    const result = await response.json();
    console.log("SMS response:", result);
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, slug } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ success: false, message: "شماره تماس الزامی است" }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ success: false, message: "شناسه کسب و کار الزامی است" }, { status: 400 });
    }

    const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
    
    if (cleanedPhone.length !== 10) {
      return NextResponse.json({ success: false, message: "شماره تماس نامعتبر است" }, { status: 400 });
    }

    // تولید کد تصادفی 6 رقمی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // ذخیره OTP در دیتابیس
    await query(
      `INSERT INTO booking_otp (phone, name, slug, otp_code, expires_at, created_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), NOW())
       ON DUPLICATE KEY UPDATE 
       otp_code = VALUES(otp_code), 
       expires_at = VALUES(expires_at),
       name = VALUES(name),
       created_at = NOW()`,
      [cleanedPhone, name || "", slug, otpCode]
    );
    
    // ارسال پیامک واقعی
    const smsSent = await sendSms(cleanedPhone, otpCode);
    
    if (!smsSent) {
      // در صورت خطا در ارسال پیامک، OTP را برای دیباگ در لاگ ثبت کن (فقط در محیط توسعه)
      console.error(`Failed to send SMS to ${cleanedPhone}. OTP: ${otpCode}`);
      
      // در محیط توسعه، کد را در پاسخ برگردان (برای تست)
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "کد تأیید برای شما ارسال شد",
          debug_otp: otpCode,
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: "خطا در ارسال پیامک. لطفاً مجدداً تلاش کنید." 
      }, { status: 500 });
    }
    
    console.log(`OTP sent to ${cleanedPhone}: ${otpCode}`);
    
    return NextResponse.json({
      success: true,
      message: "کد تأیید برای شما ارسال شد",
    });
    
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ 
      success: false, 
      message: "خطا در ارسال کد تأیید" 
    }, { status: 500 });
  }
}