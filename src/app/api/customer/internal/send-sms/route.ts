// src/app/api/internal/send-sms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // بررسی کلید داخلی برای امنیت
    const internalKey = req.headers.get("x-internal-key");
    const expectedKey = process.env.INTERNAL_API_KEY || "my-secret-internal-key";
    
    if (internalKey !== expectedKey && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }
    
    const {
      to_phone,
      template_key,
      name,
      date,
      time,
      service,
      salon,
      phone: businessPhone,
    } = await req.json();
    
    const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
    const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";
    
    if (!IP_PANEL_API_KEY) {
      console.error("❌ API Key پیامک تنظیم نشده است");
      return NextResponse.json(
        { success: false, message: "API Key پیامک تنظیم نشده است" },
        { status: 500 }
      );
    }
    
    const cleanPhone = to_phone.replace(/\D/g, "").slice(-10);
    const recipient = `+98${cleanPhone}`;
    
    const payload = {
      sending_type: "pattern",
      from_number: SENDER_NUMBER,
      code: template_key,
      recipients: [recipient],
      params: {
        name: name || "مشتری عزیز",
        date: date || "---",
        time: time || "---",
        service: service || "خدمات",
        salon: salon || "کسب‌وکار",
        phone: businessPhone || "",
      },
    };
    
    console.log("[Internal SMS] ارسال پیامک:", {
      to: recipient,
      template: template_key,
    });
    
    const response = await fetch("https://edge.ippanel.com/v1/api/send", {
      method: "POST",
      headers: {
        Authorization: IP_PANEL_API_KEY.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("[Internal SMS] پیامک با موفقیت ارسال شد");
      return NextResponse.json({ success: true, result });
    } else {
      console.error("[Internal SMS] خطا در ارسال:", result);
      return NextResponse.json(
        { success: false, message: result?.meta?.message || "خطا در ارسال پیامک" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("[Internal SMS] خطا:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی" },
      { status: 500 }
    );
  }
}