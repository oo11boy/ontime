// app/api/admin/expiry-notifications/expired-notified/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    // کاربرانی که منقضی شده‌اند و پیامک پس از انقضا برایشان ارسال شده
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
         AND u.has_received_expired_notification = 1
         AND u.plan_key NOT IN ('free_trial', 'free')
       ORDER BY u.ended_at DESC
       LIMIT 200`,
      []
    );
    
    console.log(`Found ${users.length} expired users with notification sent`);
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching expired notified users:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت کاربران منقضی شده با پیامک ارسال شده" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);