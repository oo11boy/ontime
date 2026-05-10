// src/app/api/admin/support-tickets/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const PUT = withAdminAuth(async (req: NextRequest, context: any) => {
  const { userId, role } = context;
  
  console.log("========== [STATUS API START] ==========");
  console.log("Admin userId:", userId);
  
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
    const { status } = body;
    console.log("New status:", status);
    
    if (!status) {
      return NextResponse.json(
        { success: false, message: "وضعیت جدید الزامی است" },
        { status: 400 }
      );
    }
    
    await query(
      `UPDATE support_tickets 
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, ticketId]
    );
    
    console.log("✅ Status updated successfully");
    
    return NextResponse.json({
      success: true,
      message: "وضعیت تیکت با موفقیت تغییر کرد",
    });
  } catch (error) {
    console.error("❌ Error updating ticket status:", error);
    return NextResponse.json(
      { success: false, message: "خطا در تغییر وضعیت" },
      { status: 500 }
    );
  } finally {
    console.log("========== [STATUS API END] ==========\n");
  }
});