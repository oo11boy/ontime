// app/api/admin/send-expiry-notification/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
const SENDER_NUMBER = process.env.SENDER_NUMBER;
const EXPIRY_PATTERN_CODE = "e9fg5vj38lyd95q";
const EXPIRED_PATTERN_CODE = "v3zqiwml7vxdsbe";

async function sendExpirySms(phone: string, businessName: string): Promise<boolean> {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: IP_PANEL_API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER_NUMBER,
        code: EXPIRY_PATTERN_CODE,
        recipients: [formattedPhone],
        params: { name: businessName || "مشتری عزیز" },
      }),
    });
    const result = await response.json();
    console.log("Send expiry SMS result:", result);
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

async function sendExpiredSms(phone: string, businessName: string): Promise<boolean> {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: IP_PANEL_API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER_NUMBER,
        code: EXPIRED_PATTERN_CODE,
        recipients: [formattedPhone],
        params: { name: businessName || "مشتری عزیز" },
      }),
    });
    const result = await response.json();
    console.log("Send expired SMS result:", result);
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export const POST = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    const body = await req.json();
    const { userId, type } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // دریافت اطلاعات کاربر
    const users = await query<any>(
      "SELECT id, phone, business_name, ended_at, has_received_expiry_notification, has_received_expired_notification FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    let smsSent = false;
    let smsType = '';
    let updateField = '';

    // ارسال بر اساس نوع
    if (type === 'expired') {
      console.log(`Sending expired SMS to ${user.phone}...`);
      smsSent = await sendExpiredSms(user.phone, user.business_name);
      smsType = 'manual_expired_notification';
      updateField = 'has_received_expired_notification';
    } else {
      console.log(`Sending expiry SMS to ${user.phone}...`);
      smsSent = await sendExpirySms(user.phone, user.business_name);
      smsType = 'manual_expiry_notification';
      updateField = 'has_received_expiry_notification';
    }

    if (smsSent) {
      // ثبت در smslog
      await query(
        `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at) 
         VALUES (?, ?, ?, ?, 'sent', NOW())`,
        [user.id, user.phone, `ارسال دستی - ${user.business_name || user.phone}`, smsType]
      );
      
      // آپدیت فلگ مربوطه
      await query(
        `UPDATE users SET ${updateField} = 1 WHERE id = ?`,
        [user.id]
      );
      
      console.log(`✅ Flag ${updateField} updated to 1 for user ${user.id}`);
      
      return NextResponse.json({ 
        success: true, 
        message: "پیامک با موفقیت ارسال شد",
        updatedField: updateField
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "خطا در ارسال پیامک" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Manual expiry notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}, ['super_admin', 'editor']);