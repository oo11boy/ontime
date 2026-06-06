// app/api/admin/expiry-notifications/failed/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    // کاربرانی که پیامک expiry برایشان ارسال نشده (2 روز قبل)
    const failedExpiryUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, 'expiry' as type,
              DATEDIFF(u.ended_at, CURDATE()) as days_left
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at > CURDATE() 
         AND DATEDIFF(u.ended_at, CURDATE()) <= 3
         AND DATEDIFF(u.ended_at, CURDATE()) >= 1
         AND (u.has_received_expiry_notification = 0 OR u.has_received_expiry_notification IS NULL)
         AND u.business_name IS NOT NULL
         AND u.business_name != ''
         AND u.business_name != 'NULL'
       ORDER BY u.ended_at ASC
       LIMIT 100`,
      []
    );
    
    // کاربرانی که پیامک expired برایشان ارسال نشده (پس از انقضا)
    const failedExpiredUsers = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, 'expired' as type,
              DATEDIFF(CURDATE(), u.ended_at) as days_ago
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at <= CURDATE()
         AND u.ended_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND (u.has_received_expired_notification = 0 OR u.has_received_expired_notification IS NULL)
         AND u.business_name IS NOT NULL
         AND u.business_name != ''
         AND u.business_name != 'NULL'
       ORDER BY u.ended_at DESC
       LIMIT 100`,
      []
    );
    
    console.log(`Failed expiry users: ${failedExpiryUsers.length}`);
    console.log(`Failed expired users: ${failedExpiredUsers.length}`);
    
    const allFailedUsers = [...failedExpiryUsers, ...failedExpiredUsers];
    
    return NextResponse.json({ success: true, users: allFailedUsers });
  } catch (error) {
    console.error("Error fetching failed users:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت کاربران ناموفق" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);