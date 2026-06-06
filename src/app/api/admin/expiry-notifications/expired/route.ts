// app/api/admin/expiry-notifications/expired/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    // نمایش کاربران منقضی شده که دارای نام کسب‌وکار هستند (business_name不为空且不为空字符串)
    const users = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, u.plan_key,
              u.has_received_expiry_notification,
              u.has_received_expired_notification,
              DATEDIFF(CURDATE(), u.ended_at) as days_ago,
              (SELECT COUNT(*) FROM smslog WHERE user_id = u.id AND sms_type = 'expired_notification' AND status = 'sent') as sms_count,
              (SELECT MAX(created_at) FROM smslog WHERE user_id = u.id AND sms_type = 'expired_notification' AND status = 'sent') as last_sent_at
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at <= CURDATE()
         AND u.business_name IS NOT NULL
         AND u.business_name != ''
         AND u.business_name != 'NULL'
       ORDER BY u.ended_at DESC
       LIMIT 200`,
      []
    );
    
    console.log(`Found ${users.length} expired users with business name`);
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching expired users:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت کاربران منقضی شده" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);