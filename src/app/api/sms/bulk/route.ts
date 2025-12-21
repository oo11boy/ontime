// File Path: src/app/api/sms/bulk/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server"; // استفاده از فایل امن سروری

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { recipients, message, sms_type = "bulk" } = body;

    // ۱. بررسی اعتبار ورودی‌ها
    if (!recipients?.length || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "لیست گیرندگان یا متن پیام خالی است" },
        { status: 400 }
      );
    }

    const count = recipients.length;

    // ۲. چک کردن موجودی (سمت سرور)
    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < count) {
      return NextResponse.json(
        {
          success: false,
          message: `موجودی ناکافی است. نیاز به ${count} واحد و موجودی شما ${balance.total_balance} است.`,
        },
        { status: 402 }
      );
    }

    // ۳. کسر کل موجودی به صورت یکجا
    const deducted = await deductSms(userId, count);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی" },
        { status: 500 }
      );
    }

    // ۴. بهینه‌سازی ثبت در دیتابیس (Bulk Insert)
    // به جای اجرای کوئری در حلقه، داده‌ها را آماده می‌کنیم
    const values: any[] = [];
    const placeholders: string[] = [];

    for (const { phone, booking_id = null, name = "" } of recipients) {
      const personalized = message.replace(/{client_name}/g, name || "مشتری");

      placeholders.push("(?, ?, ?, ?, 1, ?, 'sent', NOW())");
      values.push(userId, booking_id, phone, personalized, sms_type);
    }

    // اجرای یکجای تمام INSERTها برای سرعت بالا
    if (values.length > 0) {
      const sql = `
        INSERT INTO smslog (user_id, booking_id, to_phone, content, cost, sms_type, status, created_at)
        VALUES ${placeholders.join(", ")}
      `;
      await query(sql, values);
    }

    // ۵. دریافت موجودی جدید جهت آپدیت فرانت‌بند
    const newBalance = await getSmsBalanceDetails(userId);

    return NextResponse.json({
      success: true,
      message: `پیامک برای ${count} نفر در صف ارسال قرار گرفت`,
      newBalance: newBalance.total_balance,
    });
  } catch (error) {
    console.error("❌ Bulk SMS Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور در ارسال گروهی" },
      { status: 500 }
    );
  }
});
