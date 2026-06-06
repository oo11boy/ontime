import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async () => {
  try {
    // کل پیامک‌های ارسال شده موفق
    const [totalSentResult] = await query<any>(
      `SELECT COUNT(*) as count FROM smslog 
       WHERE sms_type IN ('expiry_notification', 'expired_notification') AND status = 'sent'`,
      []
    );
    
    // پیامک‌های ناموفق
    const [totalFailedResult] = await query<any>(
      `SELECT COUNT(*) as count FROM smslog 
       WHERE sms_type IN ('expiry_notification', 'expired_notification') AND status != 'sent'`,
      []
    );
    
    // ارسال‌های هفته گذشته
    const [lastWeekResult] = await query<any>(
      `SELECT COUNT(*) as count FROM smslog 
       WHERE sms_type IN ('expiry_notification', 'expired_notification') 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND status = 'sent'`,
      []
    );
    
    // کاربرانی که 2 روز مونده
    const [upcomingResult] = await query<any>(
      `SELECT COUNT(*) as count FROM users 
       WHERE ended_at IS NOT NULL 
         AND ended_at > CURDATE() 
         AND DATEDIFF(ended_at, CURDATE()) = 2
         AND plan_key NOT IN ('free_trial', 'free')`,
      []
    );
    
    const totalSent = totalSentResult?.count || 0;
    const totalFailed = totalFailedResult?.count || 0;
    const total = totalSent + totalFailed;
    const successRate = total > 0 ? Math.round((totalSent / total) * 100) : 0;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalSent,
        totalFailed,
        lastWeekSent: lastWeekResult?.count || 0,
        successRate,
        upcomingExpiries: upcomingResult?.count || 0,
        totalExpired: 0,
        totalExpirySent: 0,
        totalExpiredSent: 0
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت آمار" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);