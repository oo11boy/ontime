// src/app/api/admin/support-tickets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context: any) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه تیکت الزامی است" },
        { status: 400 }
      );
    }

    const tickets = await query(
      `SELECT * FROM support_tickets WHERE id = ?`,
      [id]
    );

    const replies = await query(
      `SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      ticket: tickets[0],
      replies: replies || [],
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
});