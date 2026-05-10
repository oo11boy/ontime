// src/app/api/client/support-tickets/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, context: any) => {
  const { userId } = context;
  
  // دریافت id از params (در Next.js 15 باید await شود)
  const params = await context.params;
  const ticketId = params?.id;

  if (!ticketId) {
    return NextResponse.json(
      { success: false, message: "شناسه تیکت الزامی است" },
      { status: 400 }
    );
  }

  try {
    const tickets = await query(
      `SELECT * FROM support_tickets WHERE id = ? AND user_id = ?`,
      [ticketId, userId]
    );

    if (tickets.length === 0) {
      return NextResponse.json(
        { success: false, message: "تیکت یافت نشد" },
        { status: 404 }
      );
    }

    const replies = await query(
      `SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticketId]
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