// app/api/sms/bulk/route.ts - بخش مهم کد

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails, checkSmsBalance } from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";
import { cookies } from "next/headers";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;
  
  // دریافت staffId از کوکی
  const cookieStore = await cookies();
  const staffIdFromCookie = cookieStore.get("staff_id")?.value;
  const staffId = staffIdFromCookie ? parseInt(staffIdFromCookie) : null;

  try {
    const body = await req.json();
    const { recipients, templateKey, sms_type = "bulk_customers" } = body;

    // اعتبارسنجی
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, message: "لیست گیرندگان خالی است" }, { status: 400 });
    }

    if (!templateKey) {
      return NextResponse.json({ success: false, message: "الگوی پیامک انتخاب نشده است" }, { status: 400 });
    }

    // خواندن الگو
    const [templateRaw] = await query(
      `SELECT id, message_count, payamresan_id, content
       FROM smstemplates 
       WHERE payamresan_id = ?
         AND (user_id = ? OR user_id IS NULL)
       LIMIT 1`,
      [templateKey, userId]
    );

    const template = templateRaw as
      | { id: number; message_count: number; payamresan_id: string; content: string }
      | undefined;

    if (!template) {
      return NextResponse.json({ success: false, message: "الگوی پیامک یافت نشد" }, { status: 404 });
    }

    const smsPerMessage = Number(template.message_count) || 1;
    const totalNeeded = recipients.length * smsPerMessage;

    // نام سالن
    const [userRaw] = await query("SELECT business_name, name FROM users WHERE id = ?", [userId]);
    const userRow = userRaw as { business_name?: string; name?: string } | undefined;
    const salonName = userRow?.business_name?.trim() || userRow?.name?.trim() || "مدیریت";

    // بررسی موجودی قبل از کسر
    const balanceCheck = await checkSmsBalance(userId, totalNeeded, staffId);
    if (!balanceCheck.hasEnough) {
      return NextResponse.json(
        {
          success: false,
          message: balanceCheck.message,
        },
        { status: 402 }
      );
    }

    // کسر موجودی
    let deducted = false;
    try {
      deducted = await deductSms(userId, totalNeeded, staffId);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "خطا در کسر موجودی" },
        { status: 500 }
      );
    }

    if (!deducted) {
      return NextResponse.json({ success: false, message: "خطا در کسر موجودی" }, { status: 500 });
    }

    // پردازش گیرنده‌ها
    const queueTasks = recipients.map(async (rec: any, idx: number) => {
      const name = rec.name?.trim() || "مشتری";
      const phone = rec.phone?.replace(/\D/g, "").slice(-10);

      if (!phone || phone.length !== 10) {
        console.warn(`[BULK-SMS] شماره نامعتبر (ردیف ${idx + 1}): ${rec.phone}`);
        return null;
      }

      const [logRaw] = await query(
        `INSERT INTO smslog (user_id, to_phone, content, cost, sms_type, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        [userId, phone, `Bulk: ${templateKey} → ${name} (${smsPerMessage} واحد)`, smsPerMessage, sms_type]
      );

      const log = logRaw as { insertId: number } | undefined;
      const logId = log?.insertId;

      if (!logId) {
        console.error(`[BULK-SMS] ثبت لاگ ناموفق برای ${phone}`);
        return null;
      }

      try {
        await smsQueue.add(
          "send-sms",
          {
            logId,
            to_phone: phone,
            template_key: templateKey,
            message_count: smsPerMessage,
            params: { name, salon: salonName },
          },
          { attempts: 4, backoff: { type: "exponential", delay: 6000 } }
        );
        return true;
      } catch (qErr: any) {
        console.error(`[BULK-SMS] خطا در صف (Log ${logId}):`, qErr.message);
        return false;
      }
    });

    const outcomes = await Promise.allSettled(queueTasks);
    const successCount = outcomes.filter(r => r.status === "fulfilled" && r.value === true).length;

    const newBalance = await getSmsBalanceDetails(userId, staffId);

    return NextResponse.json({
      success: true,
      message: `درخواست ارسال برای ${recipients.length} نفر ثبت شد`,
      count: recipients.length,
      units: totalNeeded,
      successCount,
      remainingBalance: newBalance.total_balance,
      userType: newBalance.userType,
    });
  } catch (err: any) {
    console.error("[BULK-SMS] خطای کلی:", err);
    return NextResponse.json(
      { success: false, message: err.message || "خطای سرور در پردازش ارسال گروهی" },
      { status: 500 }
    );
  }
});