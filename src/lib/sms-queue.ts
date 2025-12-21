// src/lib/sms-queue.ts
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";
import fetch from "node-fetch"; // ← جایگزین fetch داخلی Node.js (حل مشکل fetch failed)

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

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

async function sendToIPPANEL(jobData: {
  logId: number;
  to_phone: string;
  content: string;
  template_key?: string | null;
}) {
  const { logId, to_phone, content, template_key } = jobData;
  const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY!;
  const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";

  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    if (template_key) {
      // ۱. استخراج هوشمند متغیرها بر اساس متن پترن‌های شما
      // متن پترن رزرو: %name% عزیز، نوبت شما برای تاریخ %date% ساعت %time% ...
      // متن پترن یادآوری: یادآوری: %name% عزیز، نوبت شما برای تاریخ %date% ساعت %time% ...
      
      let name = "مشتری";
      let date = "تاریخ";
      let time = "ساعت";

      // تلاش برای جدا کردن نام (هر چیزی قبل از کلمه "عزیز")
      const nameMatch = content.match(/^([^،:]+?)\s+عزیز/i) || content.match(/یادآوری:\s*([^،]+?)\s+عزیز/i);
      if (nameMatch) name = nameMatch[1].trim();

      // تلاش برای جدا کردن تاریخ (بعد از "تاریخ" تا قبل از "ساعت")
      const dateMatch = content.match(/تاریخ\s+(.+?)\s+ساعت/i);
      if (dateMatch) date = dateMatch[1].trim();

      // تلاش برای جدا کردن ساعت (بعد از "ساعت" تا اولین فضای خالی یا کلمه بعدی)
      const timeMatch = content.match(/ساعت\s+(\d{2}:\d{2})/i);
      if (timeMatch) time = timeMatch[1].trim();

      console.log(`[SMS Queue] ارسال با پترن ${template_key}:`, { name, date, time });

      const patternRes = await fetch("https://edge.ippanel.com/v1/api/send", {
        method: "POST",
        headers: { 
          "Authorization": IP_PANEL_API_KEY, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          sending_type: "pattern",
          from_number: SENDER_NUMBER,
          recipients: [to_phone.replace(/^0/, "+98")],
          code: template_key,
          // نام متغیرها باید دقیقاً name, date, time باشد
          params: { name, date, time } 
        })
      });

      const result: any = await patternRes.json();
      
      if (patternRes.ok && result.meta?.status) {
        messageId = result.data?.message_outbox_ids?.[0];
        status = "sent";
      } else {
        // اگر پترن خطا داد (مثلاً Invalid Token)، به صورت معمولی بفرست
        console.warn("[SMS Queue] خطای پترن، سوئیچ به ارسال معمولی:", result.meta?.message);
        throw new Error("Pattern failed"); 
      }
    } else {
      throw new Error("No template key");
    }

  } catch (err) {
    // ۲. متد جایگزین (Fallback): ارسال به صورت پیامک معمولی (Normal)
    // این بخش باعث می‌شود حتی اگر پترن ایراد داشت، پیامک حتماً به دست مشتری برسد
    try {
      const normalRes = await fetch("https://edge.ippanel.com/v1/api/send", {
        method: "POST",
        headers: { 
          "Authorization": IP_PANEL_API_KEY, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          sending_type: "normal",
          from_number: SENDER_NUMBER,
          recipients: [to_phone.replace(/^0/, "+98")],
          message: content
        })
      });
      const normalResult: any = await normalRes.json();
      if (normalRes.ok && normalResult.meta?.status) {
        messageId = normalResult.data?.message_outbox_ids?.[0];
        status = "sent";
      } else {
        errorMsg = normalResult.meta?.message || "Internal Error";
      }
    } catch (finalErr: any) {
      errorMsg = finalErr.message;
    }
  }

  // ۳. ثبت وضعیت در دیتابیس
  await query(
    `UPDATE smslog SET status = ?, message_id = ?, error_message = ? WHERE id = ?`,
    [status, messageId, errorMsg, logId]
  );
}

// Worker اصلی
export const smsWorker = new Worker(
  "sms",
  async (job: Job) => {
    console.log(`شروع پردازش جاب ${job.id} — data:`, job.data);
    await sendToIPPANEL(
      job.data as {
        logId: number;
        to_phone: string;
        content: string;
        template_key?: string | null;
      }
    );
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
    `❌ جاب ${job?.id || "نامشخص"} شکست خورد — logId: ${
      job?.data?.logId || "نامشخص"
    } — خطا:`,
    err.message || err
  );
});

smsWorker.on("stalled", (jobId: string) => {
  console.warn(`⚠️ جاب ${jobId} متوقف شد — تلاش مجدد در جریان است...`);
});
