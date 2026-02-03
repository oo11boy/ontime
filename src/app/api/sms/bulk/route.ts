// app/api/sms/bulk/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server";
import { smsQueue } from "@/lib/sms-queue";

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();

    console.log("[BULK-SMS] درخواست دریافت شد", {
      userId,
      time: new Date().toISOString(),
      recipients: body.recipients?.length || 0,
      templateKey: body.templateKey || "نامشخص",
      samplePhone: body.recipients?.[0]?.phone || "ندارد",
    });

    const { recipients, templateKey, sms_type = "bulk_customers" } = body;

    // اعتبارسنجی پایه
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, message: "لیست گیرندگان خالی است" }, { status: 400 });
    }

    if (!templateKey) {
      return NextResponse.json({ success: false, message: "الگوی پیامک انتخاب نشده است" }, { status: 400 });
    }

    // ── خواندن الگو (با type assertion ساده) ──
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

    console.log("[BULK-SMS] الگو:", {
      پیدا_شد: !!template,
      message_count: template?.message_count ?? "نامشخص",
      طول_محتوا: template?.content?.length ?? 0,
    });

    if (!template) {
      return NextResponse.json({ success: false, message: "الگوی پیامک یافت نشد" }, { status: 404 });
    }

    const smsPerMessage = Number(template.message_count) || 1;
    const totalNeeded = recipients.length * smsPerMessage;

    // نام سالن
    const [userRaw] = await query("SELECT business_name, name FROM users WHERE id = ?", [userId]);
    const userRow = userRaw as { business_name?: string; name?: string } | undefined;
    const salonName = userRow?.business_name?.trim() || userRow?.name?.trim() || "مدیریت";

    // موجودی
    const balance = await getSmsBalanceDetails(userId);
    console.log("[BULK-SMS] موجودی:", {
      کل: balance.total_balance,
      مورد_نیاز: totalNeeded,
      کافی_است: balance.total_balance >= totalNeeded,
    });

    if (balance.total_balance < totalNeeded) {
      return NextResponse.json(
        {
          success: false,
          message: `موجودی کافی نیست (نیاز: ${totalNeeded} واحد، موجود: ${balance.total_balance})`,
        },
        { status: 402 }
      );
    }

    // کسر موجودی
    const deducted = await deductSms(userId, totalNeeded);
    console.log("[BULK-SMS] کسر موجودی:", { success: deducted });

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

      // ثبت لاگ (با type assertion)
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

      console.log(`[BULK-SMS] لاگ ثبت شد → ${logId} | ${phone}`);

      // ارسال به صف (اگر Redis باشه کار می‌کنه، اگر نه خطا می‌ده ولی ادامه می‌ده)
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
        console.log(`[BULK-SMS] به صف اضافه شد → ${logId}`);
        return true;
      } catch (qErr: any) {
        console.error(`[BULK-SMS] خطا در صف (Log ${logId}):`, qErr.message);
        return false;
      }
    });

    const outcomes = await Promise.allSettled(queueTasks);
    const successCount = outcomes.filter(r => r.status === "fulfilled" && r.value === true).length;

    console.log("[BULK-SMS] خلاصه:", {
      کل_گیرنده: recipients.length,
      موفق: successCount,
      ناموفق: recipients.length - successCount,
    });

    const newBalance = await getSmsBalanceDetails(userId);

    return NextResponse.json({
      success: true,
      message: `درخواست ارسال برای ${recipients.length} نفر (مجموع ${totalNeeded} واحد) ثبت شد`,
      count: recipients.length,
      units: totalNeeded,
      successCount,
      remainingBalance: newBalance.total_balance,
    });
  } catch (err: any) {
    console.error("[BULK-SMS] خطای کلی:", {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack?.split("\n")?.slice(0, 5),
    });

    return NextResponse.json(
      {
        success: false,
        message: "خطای سرور در پردازش ارسال گروهی",
        detail: err.sqlMessage || err.message || "نامشخص",
      },
      { status: 500 }
    );
  }
});