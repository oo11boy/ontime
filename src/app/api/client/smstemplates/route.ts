// src/app/api/client/sms-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const sql = `
      SELECT 
        t.id, 
        t.name as title,
        t.content,
        t.type,
        t.sub_type,
        t.payamresan_id,
        t.message_count,
        t.job_id,
        j.persian_name as job_name
      FROM smstemplates t
      LEFT JOIN jobs j ON t.job_id = j.id
      WHERE t.user_id = ? OR t.user_id IS NULL 
      ORDER BY 
        CASE WHEN t.job_id IS NULL THEN 0 ELSE 1 END,
        t.job_id,
        t.id ASC
    `;

    const templates = await query<any>(sql, [userId]);

    return NextResponse.json({
      success: true,
      message: "قالب‌های پیامک با موفقیت دریافت شدند",
      templates,
    });
  } catch (error) {
    console.error("Failed to fetch SMS templates:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت قالب‌ها" },
      { status: 500 },
    );
  }
});