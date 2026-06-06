// app/api/admin/expiry-notifications/upcoming/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    const users = await query<any>(
      `SELECT u.id, u.phone, u.business_name, u.ended_at, u.has_received_expiry_notification, u.plan_key,
              DATEDIFF(u.ended_at, CURDATE()) as days_left
       FROM users u 
       WHERE u.ended_at IS NOT NULL 
         AND u.ended_at > CURDATE() 
         AND DATEDIFF(u.ended_at, CURDATE()) = 2
         AND u.plan_key NOT IN ('free_trial', 'free')
       ORDER BY u.ended_at ASC`,
      []
    );
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching upcoming users:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت کاربران" }, { status: 500 });
  }
}, ['super_admin', 'editor', 'viewer']);