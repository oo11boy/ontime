// src/lib/sms-queue.ts
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";

// ۱. تنظیمات اتصال به Redis با مدیریت خطا
const redisConnection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

// ۲. تعریف صف (Queue)
export const smsQueue = new Queue("sms", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5, // افزایش تعداد تلاش‌ها برای اطمینان بیشتر
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

/**
 * تابع اصلی ارسال پیامک از طریق IPPanel
 */
async function sendToIPPANEL(jobData: any) {
  const { logId, to_phone, template_key, params } = jobData;
  const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";

  if (!IP_PANEL_API_KEY) {
    console.error("❌ API Key پیامک در تنظیمات سیستم (.env) یافت نشد.");
    await updateLogStatus(logId, "failed", null, "Missing API Key");
    return;
  }

  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    console.log(
      `🚀 [Worker] Processing SMS for: ${to_phone} (LogID: ${logId}) | Template: ${template_key}`
    );

    // استانداردسازی شماره
    const cleanPhone = to_phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      errorMsg = "Invalid phone number format";
      console.error(`❌ Invalid phone: ${to_phone}`);
      await updateLogStatus(logId, status, messageId, errorMsg);
      return;
    }
    const recipient = `+98${cleanPhone}`;

    // آماده‌سازی پارامترها – مقدار پیش‌فرض قوی‌تر برای جلوگیری از خطای پنل
    const finalParams = {
      name: params?.name?.trim() || "مشتری عزیز",
      date: params?.date?.trim() || "---",
      time: params?.time?.trim() || "---",
      service: params?.service?.trim() || "خدمات",
      link: params?.link?.trim() || "",
      salon: params?.salon?.trim() || "آن‌تایم", // این مقدار حالا از API تک‌تک می‌آید
    };

    console.log(`[Worker] Final Params:`, finalParams);

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
}

// تابع کمکی برای بروزرسانی لاگ (جدا کردن برای خوانایی)
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

// ۳. تعریف وورکر به صورت Global (برای جلوگیری از Hot Reload در Dev)
const workerGlobalKey = "sms-worker-instance";

if (!(global as any)[workerGlobalKey]) {
  (global as any)[workerGlobalKey] = new Worker(
    "sms",
    async (job: Job) => {
      await sendToIPPANEL(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 10, // افزایش concurrency برای عملکرد بهتر
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 1000 },
    }
  );

  // لاگ‌های مفید برای دیباگ
  (global as any)[workerGlobalKey].on("completed", (job: Job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  (global as any)[workerGlobalKey].on("failed", (job: Job, err: Error) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  console.log("🛠 SMS Worker Started with Concurrency: 10");
}

export const smsWorker = (global as any)[workerGlobalKey];
