import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { PoolConnection } from "mysql2/promise";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const success = searchParams.get("success");

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();

    if (success !== "1") {
      await connection.execute(
        "UPDATE payments SET status = ? WHERE track_id = ?",
        ["canceled", trackId]
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard?payment=failed`
      );
    }

    const verifyRes = await fetch("https://gateway.zibal.ir/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: process.env.ZIBAL_CODE,
        trackId: trackId,
      }),
    });
    const vData = await verifyRes.json();

    if (vData.result === 100 && vData.status === 1) {
      await connection.beginTransaction();

      const [payInfo]: any = await connection.execute(
        "SELECT * FROM payments WHERE track_id = ? LIMIT 1",
        [trackId]
      );

      if (!payInfo || payInfo.length === 0) {
        throw new Error("تراکنش یافت نشد.");
      }

      const payment = payInfo[0];
      const userId = payment.user_id;

      await connection.execute(
        "UPDATE payments SET status = ?, ref_number = ?, card_number = ? WHERE track_id = ?",
        ["success", vData.refNumber, vData.cardNumber, trackId]
      );

      if (payment.type === "sms") {
        const smsCount = payment.item_id;
        await connection.execute(
          `INSERT INTO smspurchase 
            (user_id, type, amount_paid, ref_number, sms_amount, remaining_sms, valid_from, expires_at, status) 
            VALUES (?, 'one_time_sms', ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active')`,
          [userId, payment.amount / 10, vData.refNumber, smsCount, smsCount]
        );

        await connection.execute(
          "UPDATE users SET purchased_sms_credit = purchased_sms_credit + ? WHERE id = ?",
          [smsCount, userId]
        );
      } else if (payment.type === "plan") {
        const planId = payment.item_id;

        const [plans]: any = await connection.execute(
          "SELECT * FROM plans WHERE id = ?",
          [planId]
        );
        const plan = plans[0];

        if (plan) {
          // تعیین طول دوره پلن (رایگان ۲ ماه، بقیه ۱ ماه)
          const durationMonths = plan.plan_key === "free_trial" ? 2 : 1;

          // تاریخ شروع (امروز)
          const today = new Date();
          const startedAt = today.toISOString().split("T")[0];

          // محاسبه تاریخ پایان کل پلن (ended_at)
          const endDate = new Date();
          endDate.setMonth(today.getMonth() + durationMonths);
          const endedAt = endDate.toISOString().split("T")[0];

          // محاسبه تاریخ پایان سهمیه این ماه (quota_ends_at) - همیشه ۱ ماه بعد
          const quotaEndDate = new Date();
          quotaEndDate.setMonth(today.getMonth() + 1);
          const quotaEndsAt = quotaEndDate.toISOString().split("T")[0];

  // در فایل verify/route.ts - بخش آپدیت پلن
await connection.execute(
  `UPDATE users SET 
    plan_key = ?, 
    sms_balance = ?, 
    sms_monthly_quota = ?, 
    started_at = ?, 
    ended_at = ?, 
    quota_starts_at = ?, 
    quota_ends_at = ?,
    has_used_free_trial = 1
    WHERE id = ?`,
  [
    plan.plan_key,
    plan.free_sms_month,
    plan.free_sms_month,
    startedAt,
    endedAt,
    startedAt,
    quotaEndsAt,
    userId,
  ]
);

          // ۳. ثبت در تاریخچه خریدها
          await connection.execute(
            `INSERT INTO smspurchase 
              (user_id, type, amount_paid, ref_number, sms_amount, remaining_sms, valid_from, expires_at, status) 
              VALUES (?, 'monthly_subscription', ?, ?, ?, ?, CURDATE(), ?, 'active')`,
            [
              userId,
              payment.amount / 10,
              vData.refNumber,
              plan.free_sms_month,
              plan.free_sms_month,
              endedAt, // کل اعتبار پلن
            ]
          );
        }
      }

      await connection.commit();
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=success&trackId=${trackId}`
      );
    } else {
      await connection.execute(
        "UPDATE payments SET status = ? WHERE track_id = ?",
        ["failed", trackId]
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment/result?status=failed&trackId=${trackId}`
      );
    }
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Verify Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/result?status=failed&trackId=${trackId}`
    );
  } finally {
    if (connection) connection.release();
  }
}
