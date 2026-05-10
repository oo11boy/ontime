// src/app/api/admin/support-tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const tickets = await query(
      `SELECT * FROM support_tickets 
       ORDER BY 
         FIELD(status, 'open', 'in_progress', 'answered', 'closed'),
         FIELD(priority, 'urgent', 'high', 'normal', 'low'),
         created_at DESC`
    );

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تیکت‌ها" },
      { status: 500 }
    );
  }
});