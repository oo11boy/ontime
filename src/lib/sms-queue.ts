// src/lib/sms-queue.ts
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";

// استفاده از fetch استاندارد در Node.js 18 به بالا یا نصب node-fetch
// اگر از نسخه‌های قدیمی استفاده می‌کنید: import fetch from "node-fetch";

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
    attempts: 3, // در صورت خطا تا ۳ بار تلاش مجدد انجام شود
    backoff: {
      type: 'exponential',
      delay: 5000, // فاصله ۵ ثانیه‌ای بین تلاش‌ها
    },
  }
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
    return;
  }

  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    console.log(`🚀 [Worker] Processing SMS for: ${to_phone} (LogID: ${logId})`);

    // استانداردسازی شماره: حذف صفر اول و اضافه کردن 98
    const cleanPhone = to_phone.replace(/^(\+98|98|0)/, "");
    const recipient = `+98${cleanPhone}`;

    // آماده‌سازی پارامترها با مقادیر پیش‌فرض برای جلوگیری از خطای پنل
    const finalParams = {
      name: params?.name || "مشتری عزیز",
      date: params?.date || "---",
      time: params?.time || "---",
      service: params?.service || "خدمات",
      link: params?.link || "",
      salon: params?.salon || "آن‌تایم",
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

    // بررسی دقیق وضعیت پاسخ از IPPanel
    if (response.ok && (result.meta?.status === true || result.status === "OK")) {
      messageId = String(result.data?.message_outbox_ids?.[0] || "sent");
      status = "sent";
      console.log(`✅ SMS Sent Successfully to ${to_phone}. ID: ${messageId}`);
    } else {
      errorMsg = result?.meta?.message || result?.message || `Error Code: ${response.status}`;
      console.error(`❌ IPPanel Rejection: ${errorMsg}`);
    }
  } catch (err: any) {
    status = "failed";
    errorMsg = err.message;
    console.error(`❌ Worker Exception for ${to_phone}: ${errorMsg}`);
  }

  // بروزرسانی وضعیت در دیتابیس smslog
  try {
    await query(
      `UPDATE smslog SET status = ?, message_id = ?, error_message = ? WHERE id = ?`,
      [status, messageId, errorMsg, logId]
    );
  } catch (dbErr) {
    console.error(`❌ DB Update Fail (LogID: ${logId}):`, dbErr);
  }
}

// ۳. تعریف وورکر به صورت Global برای جلوگیری از تعدد Instance ها در محیط Dev
const workerGlobalKey = "sms-worker-instance";

if (!(global as any)[workerGlobalKey]) {
  (global as any)[workerGlobalKey] = new Worker(
    "sms",
    async (job: Job) => {
      await sendToIPPANEL(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 5, // پردازش همزمان ۵ پیامک برای سرعت بالاتر در ارسال‌های گروهی
      removeOnComplete: { count: 100 }, 
      removeOnFail: { count: 500 },
    }
  );
  console.log("🛠 SMS Worker Started with Concurrency: 5");
}

export const smsWorker = (global as any)[workerGlobalKey];