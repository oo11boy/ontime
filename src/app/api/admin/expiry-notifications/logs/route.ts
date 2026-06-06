import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async () => {
  try {
    const logs = await query<any>(
      `SELECT sl.*, u.business_name 
       FROM smslog sl
       LEFT JOIN users u ON sl.user_id = u.id
       WHERE sl.sms_type IN ('expiry_notification', 'expired_notification')
       ORDER BY sl.created_at DESC
       LIMIT 200`,
      []
    );
    
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching expiry logs:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت لاگ‌ها" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);