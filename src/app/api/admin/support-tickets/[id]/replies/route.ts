// src/app/api/admin/support-tickets/[id]/replies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: any) => {
  console.log("========== [REPLIES API START] ==========");
  console.log("Request URL:", req.url);
  
  try {
    // دریافت ID تیکت از URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const ticketId = pathParts[pathParts.length - 2];
    console.log("Ticket ID from path:", ticketId);
    
    // همچنین از query params هم چک کنیم
    const idFromQuery = url.searchParams.get("id");
    console.log("Ticket ID from query:", idFromQuery);
    
    const finalId = ticketId || idFromQuery;
    console.log("Final ticket ID:", finalId);
    
    if (!finalId) {
      return NextResponse.json(
        { success: false, message: "شناسه تیکت الزامی است" },
        { status: 400 }
      );
    }
    
    const replies = await query(
      `SELECT * FROM ticket_replies 
       WHERE ticket_id = ? 
       ORDER BY created_at ASC`,
      [finalId]
    );
    
    console.log(`✅ Found ${replies.length} replies`);
    
    return NextResponse.json({ success: true, replies });
  } catch (error) {
    console.error("❌ Error fetching replies:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت پاسخ‌ها", error: String(error) },
      { status: 500 }
    );
  } finally {
    console.log("========== [REPLIES API END] ==========\n");
  }
});