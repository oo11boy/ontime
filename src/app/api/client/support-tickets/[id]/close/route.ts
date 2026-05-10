// src/app/api/client/support-tickets/[id]/close/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (req: NextRequest, context: any) => {
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
    await query(
      `UPDATE support_tickets SET status = 'closed', updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [ticketId, userId]
    );

    return NextResponse.json({
      success: true,
      message: "تیکت با موفقیت بسته شد",
    });
  } catch (error) {
    console.error("Error closing ticket:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بستن تیکت" },
      { status: 500 }
    );
  }
});