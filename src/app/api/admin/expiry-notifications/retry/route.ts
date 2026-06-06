// app/api/admin/expiry-notifications/retry/route.ts
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
    console.log(`SMS result for ${phone}:`, result);
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
    console.log(`SMS result (expired) for ${phone}:`, result);
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export const POST = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    let successCount = 0;
    const updatedUsers: number[] = [];
    
    // ارسال مجدد برای پیامک‌های expiry (2 روز قبل)
    const failedExpiryUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.has_received_expiry_notification
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at > CURDATE() 
         AND DATEDIFF(u.ended_at, CURDATE()) <= 3
         AND DATEDIFF(u.ended_at, CURDATE()) >= 1
         AND (u.has_received_expiry_notification = 0 OR u.has_received_expiry_notification IS NULL)

       LIMIT 50`,
      []
    );
    
    console.log(`Found ${failedExpiryUsers.length} failed expiry users`);
    
    for (const user of failedExpiryUsers) {
      console.log(`Sending expiry SMS to ${user.phone}...`);
      const smsSent = await sendExpirySms(user.phone, user.business_name);
      if (smsSent) {
        await query(
          `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at) 
           VALUES (?, ?, ?, 'expiry_notification', 'sent', NOW())`,
          [user.id, user.phone, `اطلاع‌رسانی انقضای اشتراک - ${user.business_name || user.phone}`]
        );
        await query(`UPDATE users SET has_received_expiry_notification = 1 WHERE id = ?`, [user.id]);
        successCount++;
        updatedUsers.push(user.id);
        console.log(`✅ Expiry SMS sent and flag updated for user ${user.id}`);
      } else {
        console.log(`❌ Failed to send expiry SMS to ${user.phone}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // ارسال مجدد برای پیامک‌های expired (پس از انقضا)
    const failedExpiredUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.has_received_expired_notification, u.has_received_expiry_notification
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at <= CURDATE()
         AND u.ended_at >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
         AND (u.has_received_expired_notification = 0 OR u.has_received_expired_notification IS NULL)
    
       LIMIT 50`,
      []
    );
    
    console.log(`Found ${failedExpiredUsers.length} failed expired users`);
    
    for (const user of failedExpiredUsers) {
      console.log(`Sending expired SMS to ${user.phone}...`);
      const smsSent = await sendExpiredSms(user.phone, user.business_name);
      if (smsSent) {
        await query(
          `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at) 
           VALUES (?, ?, ?, 'expired_notification', 'sent', NOW())`,
          [user.id, user.phone, `اطلاع‌رسانی انقضای اشتراک (پس از اتمام) - ${user.business_name || user.phone}`]
        );
        await query(`UPDATE users SET has_received_expired_notification = 1 WHERE id = ?`, [user.id]);
        successCount++;
        updatedUsers.push(user.id);
        console.log(`✅ Expired SMS sent and flag updated for user ${user.id}`);
      } else {
        console.log(`❌ Failed to send expired SMS to ${user.phone}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // لاگ نهایی
    console.log(`Total success: ${successCount}, Updated users: ${updatedUsers.join(', ')}`);
    
    return NextResponse.json({ success: true, successCount, updatedUsers });
  } catch (error: any) {
    console.error("Error in retry:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ['super_admin', 'editor']);