// src/app/api/client/sms-suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth, type RouteContext } from "@/lib/auth";

// POST: ثبت پیشنهاد تمپلیت
export const POST = withAuth(async (req: NextRequest, context: RouteContext & { userId: number }) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { title, content, type = "other" } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "عنوان و متن پیامک الزامی است" },
        { status: 400 }
      );
    }

    // دریافت اطلاعات کاربر
    const user = await query(
      "SELECT name, phone FROM users WHERE id = ?",
      [userId]
    );

    const userName = (user[0] as any)?.name || "کاربر";
    const userPhone = (user[0] as any)?.phone || "";

    await query(
      `INSERT INTO sms_template_suggestions 
       (user_id, user_name, user_phone, title, content, type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, userName, userPhone, title.trim(), content.trim(), type]
    );

    return NextResponse.json({
      success: true,
      message: "پیشنهاد شما با موفقیت ثبت شد",
    });
  } catch (error) {
    console.error("Error in POST sms-suggestions:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت پیشنهاد" },
      { status: 500 }
    );
  }
});

// GET: دریافت پیشنهادات کاربر جاری
export const GET = withAuth(async (req: NextRequest, context: RouteContext & { userId: number }) => {
  const { userId } = context;
  
  // توجه: در withAuth برای کاربران عادی، role وجود ندارد
  // برای تشخیص ادمین، باید از کوکی یا هدر دیگری استفاده کنیم یا یک API جداگانه برای ادمین داشته باشیم

  try {
    // تمام کاربران فقط پیشنهادات خودشان را می‌بینند
    // API ادمین جداگانه برای مشاهده همه پیشنهادات وجود دارد
    const suggestions = await query(
      `SELECT * FROM sms_template_suggestions 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error in GET sms-suggestions:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت پیشنهادات" },
      { status: 500 }
    );
  }
});