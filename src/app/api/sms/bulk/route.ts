// src/app/api/sms/bulk/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";

/**
 * API ارسال پیامک گروهی (Bulk SMS)
 * هماهنگ با هوک useSendBulkSms و پارامتر templateKey
 */
export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    
    // دریافت اطلاعات ارسالی از فرانت‌اِند
    // templateKey همان فیلدی است که در هوک و صفحه مشتریان اصلاح کردیم
    const { recipients, templateKey, sms_type = "bulk_customers" } = body;

    // ۱. اعتبارسنجی ورودی‌ها
    if (!recipients || !recipients.length) {
      return NextResponse.json(
        { success: false, message: "لیست گیرندگان خالی است" },
        { status: 400 }
      );
    }

    if (!templateKey) {
      return NextResponse.json(
        { success: false, message: "الگوی پیامک (templateKey) انتخاب نشده است" },
        { status: 400 }
      );
    }

    // ۲. دریافت نام کسب‌وکار (بیزنس) کاربر برای جایگذاری در متغیر %salon%
    // از ستون business_name استفاده می‌شود که در تنظیمات ذخیره شده است
    const users: any = await query(
      "SELECT business_name, name FROM users WHERE id = ?",
      [userId]
    );
    
    const userData = Array.isArray(users) ? users[0] : users;
    const salonName = userData?.business_name || userData?.name || "مدیریت";

    // ۳. بررسی و کنترل موجودی پیامک کاربر
    const count = recipients.length;
    const balanceDetails = await getSmsBalanceDetails(userId);

    if (balanceDetails.total_balance < count) {
      return NextResponse.json(
        { 
          success: false, 
          message: `موجودی کافی نیست. تعداد گیرندگان: ${count}، موجودی شما: ${balanceDetails.total_balance}` 
        },
        { status: 402 }
      );
    }

    // ۴. کسر قطعی موجودی از دیتابیس (قبل از ورود به صف)
    const isDeducted = await deductSms(userId, count);
    if (!isDeducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی از حساب کاربر" },
        { status: 500 }
      );
    }

    // ۵. ثبت لاگ و افزودن پیامک‌ها به صف پردازش (BullMQ)
    const queuePromises = recipients.map(async (recipient: any) => {
      // الف) ثبت در جدول smslog برای پیگیری وضعیت
      const logResult: any = await query(
        `INSERT INTO smslog (user_id, to_phone, content, cost, sms_type, status, created_at)
         VALUES (?, ?, ?, 1, ?, 'pending', NOW())`,
        [
          userId, 
          recipient.phone, 
          `Pattern: ${templateKey} | To: ${recipient.name || 'مشتری'}`, 
          sms_type
        ]
      );

      // استخراج ID لاگ ثبت شده
      const logId = logResult?.insertId || (logResult[0] && logResult[0].insertId);

      // ب) ارسال داده‌ها به صف پیامک جهت ارسال توسط وورکر IPPanel
      if (logId) {
        return smsQueue.add("send-sms", {
          logId,
          to_phone: recipient.phone,
          template_key: templateKey,
          params: {
            name: recipient.name || "مشتری عزیز",
            salon: salonName, // جایگذاری خودکار در الگو
          },
        });
      }
    });

    // منتظر می‌مانیم تا تمام موارد در صف ثبت شوند
    await Promise.all(queuePromises);

    // ۶. دریافت موجودی جدید جهت نمایش در فرانت‌اِند
    const updatedBalance = await getSmsBalanceDetails(userId);

    return NextResponse.json({
      success: true,
      message: `درخواست ارسال برای ${count} نفر با موفقیت در صف قرار گرفت.`,
      newBalance: updatedBalance.total_balance,
    });

  } catch (error: any) {
    console.error("❌ Bulk SMS API Error:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور در پردازش ارسال گروهی" },
      { status: 500 }
    );
  }
});