// src/app/api/admin/sms-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

// GET: دریافت همه پیشنهادات
export const GET = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const suggestions = await query(
      `SELECT * FROM sms_template_suggestions 
       ORDER BY 
         FIELD(status, 'pending', 'approved', 'rejected'),
         created_at DESC`
    );

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت پیشنهادات" },
      { status: 500 }
    );
  }
});

// PUT: بروزرسانی وضعیت پیشنهاد (بدون اضافه شدن خودکار)
export const PUT = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const body = await req.json();
    const { id, status, admin_note } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "شناسه و وضعیت الزامی است" },
        { status: 400 }
      );
    }

    // فقط وضعیت پیشنهاد را آپدیت کن، هیچ چیز دیگری اضافه نکن
    await query(
      `UPDATE sms_template_suggestions 
       SET status = ?, admin_note = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, admin_note || null, id]
    );

    // پیام مناسب بر اساس وضعیت
    const message = status === "approved" 
      ? "پیشنهاد با موفقیت تایید شد" 
      : "پیشنهاد رد شد";

    return NextResponse.json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی" },
      { status: 500 }
    );
  }
});