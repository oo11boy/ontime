// src/lib/sms-queue.ts
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";
import fetch from "node-fetch"; // ← جایگزین fetch داخلی Node.js (حل مشکل fetch failed)

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const smsQueue = new Queue("sms", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// تابع ارسال واقعی به پیام‌رسان
async function sendToPayamResan(jobData: {
  logId: number;
  to_phone: string;
  content: string;
  template_key?: string | null;
}) {
  const { logId, to_phone, content, template_key } = jobData;

  console.log(`شروع ارسال پیامک — logId: ${logId} — to: ${to_phone} — template_key: ${template_key}`);

  const PAYAM_RESAN_API_KEY = process.env.PAYAM_RESAN_API_KEY!;
  const BASE_URL = "https://api.sms-webservice.com/api/V3";

  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    let url = "";

    if (template_key) {
      const match = content.match(/(.+?) عزیز.*?تاریخ (.*?) ساعت (.*?)( ثبت شد| است)?/i);
      const p1 = match?.[1]?.trim() || "مشتری";
      const p2 = match?.[2]?.trim() || "تاریخ";
      const p3 = match?.[3]?.trim() || "ساعت";

      url = `${BASE_URL}/SendTokenSingle?ApiKey=${PAYAM_RESAN_API_KEY}&TemplateKey=${template_key}&Destination=${to_phone.replace(/^0/, "98")}&p1=${encodeURIComponent(p1)}&p2=${encodeURIComponent(p2)}&p3=${encodeURIComponent(p3)}`;
    } else {
      url = `${BASE_URL}/Send?ApiKey=${PAYAM_RESAN_API_KEY}&Text=${encodeURIComponent(content)}&Sender=3000505&Recipients=${to_phone.replace(/^0/, "98")}`;
    }

    console.log(`درخواست به پیام‌رسان: ${url.substring(0, 200)}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    } as any); // node-fetch@2 نیاز به cast داره

    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      messageId = result.id != null ? String(result.id) : "unknown";
      status = "sent";
      console.log(`ارسال موفق — message_id: ${messageId}`);
    } else {
      const errText = await res.text();
      errorMsg = errText.substring(0, 500);
      console.warn(`پاسخ ناموفق از پیام‌رسان: ${errText.substring(0, 200)}`);
    }
  } catch (error: any) {
    errorMsg =
      error.name === "AbortError"
        ? "Request timeout after 10s"
        : (error.message || "Connection failed");
    errorMsg = errorMsg!.substring(0, 500);
    console.error(`خطا در ارتباط با پیام‌رسان: ${errorMsg}`);
  }

  console.log("پارامترهای UPDATE smslog:", { status, messageId, errorMsg, logId });

  const params = [
    status,
    messageId ?? null,
    errorMsg ?? null,
    logId,
  ];

  console.log("پارامترهای نهایی برای query:", params);

  try {
    await query(
      `UPDATE smslog 
       SET status = ?, 
           message_id = ?, 
           error_message = ? 
       WHERE id = ?`,
      params
    );
    console.log(`آپدیت دیتابیس موفق — logId: ${logId}`);
  } catch (dbError: any) {
    console.error(`خطای دیتابیس در آپدیت smslog (logId: ${logId}):`, dbError);
    console.error("پارامترهای ارسالی به query:", params);
  }
}

// Worker اصلی
export const smsWorker = new Worker(
  "sms",
  async (job: Job) => {
    console.log(`شروع پردازش جاب ${job.id} — data:`, job.data);
    await sendToPayamResan(job.data as {
      logId: number;
      to_phone: string;
      content: string;
      template_key?: string | null;
    });
  },
  {
    connection,
    concurrency: 10,
  }
);

// لاگ‌های ورکر
smsWorker.on("completed", (job: Job) => {
  console.log(`✅ جاب ${job.id} با موفقیت تمام شد — logId: ${job.data.logId}`);
});

smsWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(
    `❌ جاب ${job?.id || "نامشخص"} شکست خورد — logId: ${job?.data?.logId || "نامشخص"} — خطا:`,
    err.message || err
  );
});

smsWorker.on("stalled", (jobId: string) => {
  console.warn(`⚠️ جاب ${jobId} متوقف شد — تلاش مجدد در جریان است...`);
});