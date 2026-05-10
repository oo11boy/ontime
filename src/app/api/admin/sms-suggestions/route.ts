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

// PUT: بروزرسانی وضعیت پیشنهاد
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

    await query(
      `UPDATE sms_template_suggestions 
       SET status = ?, admin_note = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, admin_note || null, id]
    );

    // اگر تایید شده، می‌توانیم به صورت خودکار به تمپلیت‌ها اضافه کنیم
    if (status === "approved") {
      const suggestion = await query(
        "SELECT title, content, type FROM sms_template_suggestions WHERE id = ?",
        [id]
      );
      
      if (suggestion && suggestion.length > 0) {
        // اضافه کردن به جدول smstemplates
        const s = suggestion[0] as any;
        let templateType = "generic";
        if (s.type === "reservation") templateType = "reserve";
        else if (s.type === "reminder") templateType = "reminder";
        else if (s.type === "bulk") templateType = "bulk";
        
        await query(
          `INSERT INTO smstemplates (user_id, type, name, content, message_count, created_at)
           VALUES (NULL, ?, ?, ?, 1, NOW())`,
          [templateType, s.title, s.content]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: status === "approved" ? "پیشنهاد تایید و به تمپلیت‌ها اضافه شد" : "پیشنهاد رد شد",
    });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی" },
      { status: 500 }
    );
  }
});