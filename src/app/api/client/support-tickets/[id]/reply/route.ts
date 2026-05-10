// src/app/api/client/support-tickets/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth, type RouteContext } from "@/lib/auth";

// تعریف تایپ برای پاسخ تیکت
interface TicketReply {
  id: number;
  ticket_id: number;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export const POST = withAuth(async (req: NextRequest, context: RouteContext & { userId: number }) => {
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
    const body = await req.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "متن پاسخ الزامی است" },
        { status: 400 }
      );
    }

    // بررسی وجود تیکت و وضعیت آن
    const tickets = await query<{ id: number; status: string }>(
      `SELECT id, status FROM support_tickets WHERE id = ? AND user_id = ?`,
      [ticketId, userId]
    );

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { success: false, message: "تیکت یافت نشد" },
        { status: 404 }
      );
    }

    const ticket = tickets[0];
    if (ticket.status === "closed") {
      return NextResponse.json(
        { success: false, message: "این تیکت بسته شده است و نمی‌توان به آن پاسخ داد" },
        { status: 400 }
      );
    }

    // ثبت پاسخ کاربر
    await query(
      `INSERT INTO ticket_replies (ticket_id, message, is_admin_reply, created_at)
       VALUES (?, ?, FALSE, NOW())`,
      [ticketId, message.trim()]
    );

    // به‌روزرسانی تیکت
    await query(
      `UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = ?`,
      [ticketId]
    );

    return NextResponse.json({
      success: true,
      message: "پاسخ شما با موفقیت ارسال شد",
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ارسال پاسخ" },
      { status: 500 }
    );
  }
});