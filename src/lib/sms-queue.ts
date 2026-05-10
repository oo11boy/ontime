// src/lib/sms-queue.ts
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";

// تنظیمات اتصال به Redis
const redisConnection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

// تعریف صف
export const smsQueue = new Queue("sms", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // کاهش به 3 تلاش
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

// تابع بازگرداندن اعتبار پیامک
async function refundSmsCost(logId: number, cost: number, userId: number, staffId: number | null = null) {
  try {
    console.log(`💰 Refunding ${cost} SMS credits for log ${logId} (User: ${userId}, Staff: ${staffId || "N/A"})`);
    
    if (staffId) {
      // بازگرداندن به حساب پرسنل
      await query(
        `UPDATE staffs 
         SET sms_balance = sms_balance + ?, 
             sms_used = sms_used - ?,
             updated_at = NOW()
         WHERE id = ? AND owner_user_id = ?`,
        [cost, cost, staffId, userId]
      );
      
      // ثبت در لاگ انتقال اعتبار
      await query(
        `INSERT INTO credit_transfer_log 
         (from_user_id, to_user_id, amount, reason, related_staff_id, created_at)
         VALUES (?, ?, ?, 'refund', ?, NOW())`,
        [userId, staffId, cost, staffId]
      );
    } else {
      // بازگرداندن به حساب رییس - اولویت با بسته‌های خریداری شده
      // 1. ابتدا به بسته‌های خریداری شده برگردان
      let remainingRefund = cost;
      
      // دریافت آخرین بسته‌های خریداری شده (برای برگرداندن به آخرین بسته)
      const recentPackages = await query<any>(
        `SELECT id, remaining_sms FROM smspurchase 
         WHERE user_id = ? AND type = 'one_time_sms' AND status = 'active'
         AND remaining_sms > 0
         ORDER BY created_at DESC`,
        [userId]
      );
      
      for (const pkg of recentPackages) {
        if (remainingRefund <= 0) break;
        await query(
          `UPDATE smspurchase SET remaining_sms = remaining_sms + ? WHERE id = ?`,
          [remainingRefund, pkg.id]
        );
        remainingRefund = 0;
      }
      
      // اگر هنوز باقی مانده، به اعتبار ماهانه برگردان
      if (remainingRefund > 0) {
        await query(
          `UPDATE users SET sms_balance = sms_balance + ? WHERE id = ?`,
          [remainingRefund, userId]
        );
      }
    }
    
    // بروزرسانی لاگ پیامک با وضعیت refunded
    await query(
      `UPDATE smslog SET status = 'refunded', error_message = CONCAT(error_message, ' - اعتبار برگشت داده شد') WHERE id = ?`,
      [logId]
    );
    
    console.log(`✅ Successfully refunded ${cost} credits for log ${logId}`);
  } catch (refundError) {
    console.error(`❌ Failed to refund SMS cost for log ${logId}:`, refundError);
  }
}

// تابع اصلی ارسال پیامک از طریق IPPanel
async function sendToIPPANEL(jobData: any) {
  const { logId, to_phone, template_key, params, userId, staffId, cost, scheduled_at } = jobData;
    if (scheduled_at) {
    console.log(`⏰ Executing scheduled SMS at ${new Date(scheduled_at).toISOString()}`);
  }
  const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";

  if (!IP_PANEL_API_KEY) {
    console.error("❌ API Key پیامک در تنظیمات سیستم (.env) یافت نشد.");
    await updateLogStatus(logId, "failed", null, "Missing API Key");
    // بازگرداندن اعتبار
    await refundSmsCost(logId, cost, userId, staffId);
    return;
  }
// در تابع sendToIPPANEL، می‌توانید reminder_hours_before را در لاگ‌ها ثبت کنید
console.log(`⏰ Reminder: ${jobData.reminder_hours_before || 0} hours before booking`);
  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    console.log(`🚀 [Worker] Processing SMS for: ${to_phone} (LogID: ${logId}) | Template: ${template_key}`);

    // استانداردسازی شماره
    const cleanPhone = to_phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      errorMsg = "Invalid phone number format";
      console.error(`❌ Invalid phone: ${to_phone}`);
      await updateLogStatus(logId, status, messageId, errorMsg);
      await refundSmsCost(logId, cost, userId, staffId);
      return;
    }
    const recipient = `+98${cleanPhone}`;

    // آماده‌سازی پارامترها
    const finalParams = {
      name: params?.name?.trim() || "مشتری عزیز",
      date: params?.date?.trim() || "---",
      time: params?.time?.trim() || "---",
      service: params?.service?.trim() || "خدمات",
      link: params?.link?.trim() || "",
      salon: params?.salon?.trim() || "آن‌تایم",
    };

    const response = await fetch("https://edge.ippanel.com/v1/api/send", {
      method: "POST",
      headers: {
        Authorization: IP_PANEL_API_KEY.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER_NUMBER,
        code: template_key,
        recipients: [recipient],
        params: finalParams,
      }),
    });

    const result: any = await response.json().catch(() => ({}));

    if (response.ok && result?.data) {
      messageId = String(
        result.data?.message_outbox_ids?.[0] ||
          result.data?.bulk_id ||
          result.data?.id ||
          "sent"
      );
      status = "sent";
      console.log(`✅ SMS Sent Successfully to ${to_phone}. ID: ${messageId}`);
    } else {
      errorMsg =
        result?.meta?.message ||
        result?.message ||
        result?.error ||
        `HTTP ${response.status}`;
      console.error(`❌ IPPanel Rejection: ${errorMsg} | Response:`, result);
    }
  } catch (err: any) {
    status = "failed";
    errorMsg = err.message || "Network/Exception Error";
    console.error(`❌ Worker Exception for ${to_phone}:`, err);
  }

  // بروزرسانی وضعیت در دیتابیس
  await updateLogStatus(logId, status, messageId, errorMsg);
  
  // اگر ارسال ناموفق بود، اعتبار را برگردان
  if (status === "failed") {
    await refundSmsCost(logId, cost, userId, staffId);
  }
}

// تابع کمکی برای بروزرسانی لاگ
async function updateLogStatus(
  logId: number,
  status: "sent" | "failed",
  messageId: string | null,
  errorMsg: string | null
) {
  try {
    await query(
      `UPDATE smslog 
       SET status = ?, message_id = ?, error_message = ? 
       WHERE id = ?`,
      [status, messageId || null, errorMsg || null, logId]
    );
  } catch (dbErr) {
    console.error(`❌ DB Update Fail (LogID: ${logId}):`, dbErr);
  }
}

// تعریف وورکر
const workerGlobalKey = "sms-worker-instance";

if (!(global as any)[workerGlobalKey]) {
  (global as any)[workerGlobalKey] = new Worker(
    "sms",
    async (job: Job) => {
      await sendToIPPANEL(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 5,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 1000 },
    }
  );

  (global as any)[workerGlobalKey].on("completed", (job: Job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  (global as any)[workerGlobalKey].on("failed", async (job: Job, err: Error) => {
    console.error(`❌ Job ${job?.id} failed after all retries:`, err.message);
    
    // اگر همه تلاش‌ها ناموفق بود، اعتبار را برگردان
    if (job) {
      const { logId, cost, userId, staffId } = job.data;
      await refundSmsCost(logId, cost, userId, staffId);
    }
  });

  console.log("🛠 SMS Worker Started with Concurrency: 5");
}

export const smsWorker = (global as any)[workerGlobalKey];