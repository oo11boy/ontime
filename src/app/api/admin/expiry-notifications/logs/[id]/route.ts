// app/api/admin/expiry-notifications/logs/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const DELETE = withAdminAuth(async (req: NextRequest, context: { userId: number; role: string }) => {
  try {
    // دریافت id از URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const logId = pathParts[pathParts.length - 1];
    
    if (!logId) {
      return NextResponse.json({ success: false, error: "شناسه لاگ یافت نشد" }, { status: 400 });
    }
    
    await query(
      `DELETE FROM smslog WHERE id = ? AND sms_type IN ('expiry_notification', 'expired_notification', 'manual_expiry_notification')`,
      [logId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json({ success: false, error: "خطا در حذف لاگ" }, { status: 500 });
  }
}, ['super_admin', 'editor']);