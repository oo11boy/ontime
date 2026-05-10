// src/app/api/client/support-tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

// GET: دریافت لیست تیکت‌های کاربر
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const tickets = await query(
      `SELECT id, category, subject, message, priority, status, created_at, updated_at
       FROM support_tickets
       WHERE user_id = ?
       ORDER BY 
         FIELD(status, 'open', 'in_progress', 'answered', 'closed'),
         FIELD(priority, 'urgent', 'high', 'normal', 'low'),
         created_at DESC`,
      [userId]
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

// POST: ایجاد تیکت جدید
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { category, subject, message, priority = "normal", email } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "عنوان و متن پیام الزامی است" },
        { status: 400 }
      );
    }

    const user = await query(
      "SELECT name, phone FROM users WHERE id = ?",
      [userId]
    );

    const userName = (user[0] as any)?.name || "کاربر";
    const userPhone = (user[0] as any)?.phone || "";

    const result: any = await query(
      `INSERT INTO support_tickets 
       (user_id, user_name, user_phone, user_email, category, subject, message, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [userId, userName, userPhone, email || null, category, subject.trim(), message.trim(), priority]
    );

    return NextResponse.json({
      success: true,
      message: "تیکت شما با موفقیت ثبت شد",
      ticketId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت تیکت" },
      { status: 500 }
    );
  }
});