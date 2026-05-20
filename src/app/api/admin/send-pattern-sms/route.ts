// app/api/admin/send-pattern-sms/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { query } from "@/lib/db";

async function sendPatternSms(phone: string, patternCode: string, params: Record<string, string>) {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER = process.env.SENDER_NUMBER;

  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;

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
        code: patternCode,
        recipients: [formattedPhone],
        params: params,
      }),
    });
    
    const result = await response.json();
    console.log("SMS Result:", result);
    
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { phone, patternCode, variables, suggestionId, action } = body;

    if (!phone || !patternCode) {
      return NextResponse.json(
        { success: false, message: "شماره موبایل و کد الگو الزامی است" },
        { status: 400 }
      );
    }

    const smsSent = await sendPatternSms(phone, patternCode, variables);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, message: "خطا در ارسال پیامک" },
        { status: 500 }
      );
    }

    await query(
      `INSERT INTO smslog (user_id, to_phone, content, cost, sms_type, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'sent', NOW())`,
      [
        userId,
        phone,
        `Pattern: ${patternCode} - Action: ${action} - SuggestionId: ${suggestionId}`,
        1,
        "suggestion_notification"
      ]
    );

    return NextResponse.json({
      success: true,
      message: "پیامک با موفقیت ارسال شد",
    });
  } catch (error: any) {
    console.error("Error in send pattern SMS:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
});