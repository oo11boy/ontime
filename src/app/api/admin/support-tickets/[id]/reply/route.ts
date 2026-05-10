// src/app/api/admin/support-tickets/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const POST = withAdminAuth(async (req: NextRequest, context: any) => {
  // در withAdminAuth، context شامل userId و role است، نه adminId
  const { userId, role } = context;
  
  console.log("========== [REPLY API START] ==========");
  console.log("Admin userId:", userId);
  console.log("Admin role:", role);
  console.log("Request URL:", req.url);
  
  try {
    // دریافت ID تیکت از URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const ticketId = pathParts[pathParts.length - 2];
    console.log("Ticket ID:", ticketId);
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, message: "شناسه تیکت الزامی است" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { message } = body;
    console.log("Reply message:", message);
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "متن پاسخ الزامی است" },
        { status: 400 }
      );
    }
    
    // بررسی وجود تیکت
    const ticketExists = await query(
      "SELECT id, status FROM support_tickets WHERE id = ?",
      [ticketId]
    );
    

    
    if (!ticketExists || ticketExists.length === 0) {
      return NextResponse.json(
        { success: false, message: "تیکت یافت نشد" },
        { status: 404 }
      );
    }
    
    // ثبت پاسخ - استفاده از userId به جای adminId
    console.log("Inserting reply with adminId:", userId);
    await query(
      `INSERT INTO ticket_replies (ticket_id, admin_id, message, is_admin_reply, created_at)
       VALUES (?, ?, ?, TRUE, NOW())`,
      [ticketId, userId, message.trim()]
    );
    console.log("✅ Reply inserted successfully");
    
    // به‌روزرسانی تیکت
    await query(
      `UPDATE support_tickets 
       SET admin_response = ?, responded_at = NOW(), status = 'answered', updated_at = NOW()
       WHERE id = ?`,
      [message.trim(), ticketId]
    );
    console.log("✅ Ticket updated successfully");
    
    return NextResponse.json({
      success: true,
      message: "پاسخ با موفقیت ارسال شد",
    });
  } catch (error) {
    console.error("❌ Error sending reply:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ارسال پاسخ", error: String(error) },
      { status: 500 }
    );
  } finally {
    console.log("========== [REPLY API END] ==========\n");
  }
});