import { NextResponse } from "next/server";
import { smsQueue } from "@/lib/sms-queue";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

const localCache = new Map<string, { data: any; expiry: number }>();

async function getCachedData(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<any>
) {
  const now = Date.now();
  const cached = localCache.get(key);
  if (cached && cached.expiry > now) return cached.data;
  const freshData = await fetcher();
  localCache.set(key, { data: freshData, expiry: now + ttlMs });
  return freshData;
}

const statusHandler = withAdminAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const jobId = searchParams.get("jobId");
    const logId = searchParams.get("logId");

    try {
      // مدیریت عملیات‌ها
      if (action) {
        if (action === "calculatePrice" && req.method === "POST") {
          const body = await req.json();
          const res = await fetch(
            "https://edge.ippanel.com/v1/api/send/calculate-price",
            {
              method: "POST",
              headers: {
                Authorization: process.env.IP_PANEL_API_KEY || "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                number: process.env.SENDER_NUMBER || "+983000505",
                message: body.message,
              }),
            }
          );
          const result = await res.json();
          return NextResponse.json({ success: true, data: result.data });
        }

        if (action === "retryAll") {
          const failed = await smsQueue.getFailed(0, 100);
          await Promise.all(failed.map((j) => j.retry()));
        } else if (action === "remove" && jobId) {
          const job = await smsQueue.getJob(jobId);
          if (job) await job.remove();
        } else if (action === "deleteLog" && logId) {
          await query(`DELETE FROM smslog WHERE id = ?`, [logId]);
        } else if (action === "flush") {
          await smsQueue.drain(true);
          await query(`DELETE FROM smslog`, []);
        }
        localCache.clear();
        if (["retryAll", "remove", "deleteLog", "flush"].includes(action))
          return NextResponse.json({ success: true });
      }

      // دریافت تمامی داده‌ها به صورت موازی برای تمامی تب‌ها
      const [
        credit,
        workers,
        chart,
        counts,
        history,
        waiting,
        active,
        failed,
        delayed,
        completed,
      ] = await Promise.all([
        getCachedData("credit", 300000, () =>
          fetch("https://edge.ippanel.com/v1/api/payment/credit/mine", {
            headers: { Authorization: process.env.IP_PANEL_API_KEY || "" },
            signal: AbortSignal.timeout(3000),
          })
            .then((r) => (r.ok ? r.json().then((d) => d.data) : null))
            .catch(() => null)
        ),
        smsQueue.getWorkers(),
        getCachedData("chart", 60000, () =>
          query(
            `SELECT HOUR(created_at) as hour, COUNT(CASE WHEN status = 'sent' THEN 1 END) as success, COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed FROM smslog WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR) GROUP BY HOUR(created_at) ORDER BY hour ASC`,
            []
          )
        ),
        smsQueue.getJobCounts(),
        getCachedData("hist", 30000, () =>
          query(
            `SELECT id, to_phone as phone, content, status, created_at as timestamp FROM smslog ORDER BY created_at DESC LIMIT 150`,
            []
          )
        ),
        smsQueue.getWaiting(0, 100),
        smsQueue.getActive(),
        smsQueue.getFailed(0, 100),
        smsQueue.getDelayed(0, 100),
        smsQueue.getCompleted(0, 100),
      ]);

      const format = (jobs: any[]) =>
        jobs.map((j) => ({
          id: j.id,
          phone: j.data?.to_phone || "---",
          content: j.data?.content || "",
          error: j.failedReason || "",
          timestamp: j.timestamp,
          sendAt: j.timestamp + parseInt(j.opts?.delay || 0),
          finishedAt: j.finishedOn,
        }));

      return NextResponse.json({
        success: true,
        panel: credit,
        chart,
        workerStatus: workers.length > 0,
        counts,
        details: {
          history,
          waiting: format(waiting),
          active: format(active),
          failed: format(failed),
          delayed: format(delayed),
          completed: format(completed),
        },
      });
    } catch (e) {
      return NextResponse.json({ success: false }, { status: 500 });
    }
  },
  ["super_admin"]
);

export const GET = (req: any) => statusHandler(req);
export const POST = (req: any) => statusHandler(req);
