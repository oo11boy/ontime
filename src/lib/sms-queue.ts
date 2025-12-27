import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { query } from "@/lib/db";
import fetch from "node-fetch";

const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
);

export const smsQueue = new Queue("sms", { connection });

async function sendToIPPANEL(jobData: any) {
  const { logId, to_phone, template_key, params } = jobData;
  const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY!;
  const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";

  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let errorMsg: string | null = null;

  try {
    console.log(`\n--- 🚀 [SMS WORKER V3 - START] ---`);
    console.log(`[Job]: ${logId} | [To]: ${to_phone}`);

    const recipient = `+98${to_phone.replace(/^(\+98|98|0)/, "")}`;

    const requestBody = {
      sending_type: "pattern",
      from_number: SENDER_NUMBER,
      code: template_key,
      recipients: [recipient],
      params: {
        name: params?.name || "مشتری",
        date: params?.date || "",
        time: params?.time || "",
        service: params?.service || "خدمات",
        link: params?.link || "",
      },
    };

    console.log(`[Payload]:`, JSON.stringify(requestBody.params));

    const response = await fetch("https://edge.ippanel.com/v1/api/send", {
      method: "POST",
      headers: {
        Authorization: IP_PANEL_API_KEY.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    const result = JSON.parse(responseText);

    if (response.ok && result.meta?.status === true) {
      messageId = String(result.data?.message_outbox_ids?.[0] || "sent");
      status = "sent";
      console.log(`✅ ارسال موفق. شناسه: ${messageId}`);
    } else {
      errorMsg = result.meta?.message || "خطای پنل";
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    status = "failed";
    errorMsg = err.message;
    console.error(`❌ خطا در Worker: ${errorMsg}`);
  }

  await query(
    `UPDATE smslog SET status = ?, message_id = ?, error_message = ? WHERE id = ?`,
    [status, messageId, errorMsg, logId]
  );
  console.log(`--- 🏁 [SMS WORKER V3 - END] ---\n`);
}

// تعریف Worker
export const smsWorker = new Worker(
  "sms",
  async (job: Job) => {
    await sendToIPPANEL(job.data);
  },
  { connection, concurrency: 1 }
);
