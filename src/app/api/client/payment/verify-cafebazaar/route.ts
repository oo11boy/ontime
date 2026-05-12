// src/app/api/client/payment/verify-cafebazaar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { PoolConnection } from "mysql2/promise";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const purchaseToken = searchParams.get("purchaseToken");
  const orderId = searchParams.get("orderId");

  let connection: PoolConnection | null = null;

  try {
    connection = await dbPool.getConnection();

    // ۱. تماس با سرور کافه بازار برای تأیید نهایی
    const verifyRes = await fetch(
      "https://developer.cafebazaar.ir/api/v1/purchase/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BAZAAR_API_KEY}`,
        },
        body: JSON.stringify({
          purchaseToken: purchaseToken,
          orderId: orderId,
          packageName: process.env.BAZAAR_PACKAGE_NAME || "ir.ontime.app",
        }),
      },
    );

    const verifyData = await verifyRes.json();

    if (verifyData.status === "SUCCESS") {
      await connection.beginTransaction();

      const [payInfo]: any = await connection.execute(
        "SELECT * FROM payments WHERE track_id = ? LIMIT 1",
        [trackId],
      );

      if (!payInfo || payInfo.length === 0) {
        throw new Error("تراکنش یافت نشد.");
      }

      const payment = payInfo[0];
      const userId = payment.user_id;

      await connection.execute(
        "UPDATE payments SET status = 'success', ref_number = ? WHERE track_id = ?",
        [orderId, trackId],
      );

      // پردازش خرید (sms یا plan)
      if (payment.type === "sms") {
        const smsCount = payment.item_id;
        await connection.execute(
          `INSERT INTO smspurchase 
            (user_id, type, amount_paid, ref_number, sms_amount, remaining_sms, valid_from, expires_at, status) 
            VALUES (?, 'one_time_sms', ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active')`,
          [userId, payment.amount / 10, orderId, smsCount, smsCount],
        );

        await connection.execute(
          "UPDATE users SET purchased_sms_credit = purchased_sms_credit + ? WHERE id = ?",
          [smsCount, userId],
        );
      } else if (payment.type === "plan") {
        // پیدا کردن پلن (با پشتیبانی از id عددی و plan_key رشته)
        let plan = null;

        if (
          typeof payment.item_id === "number" ||
          !isNaN(Number(payment.item_id))
        ) {
          const [plans]: any = await connection.execute(
            "SELECT * FROM plans WHERE id = ?",
            [payment.item_id],
          );
          plan = plans?.[0];
        } else {
          const [plans]: any = await connection.execute(
            "SELECT * FROM plans WHERE plan_key = ?",
            [payment.item_id],
          );
          plan = plans?.[0];
        }

        if (plan) {
          const durationMonths = plan.plan_key === "free_trial" ? 2 : 1;
          const today = new Date();
          const startedAt = today.toISOString().split("T")[0];
          const endDate = new Date();
          endDate.setMonth(today.getMonth() + durationMonths);
          const endedAt = endDate.toISOString().split("T")[0];
          const quotaEndDate = new Date();
          quotaEndDate.setMonth(today.getMonth() + 1);
          const quotaEndsAt = quotaEndDate.toISOString().split("T")[0];

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
            ],
          );

          await connection.execute(
            `INSERT INTO smspurchase 
              (user_id, type, amount_paid, ref_number, sms_amount, remaining_sms, valid_from, expires_at, status) 
              VALUES (?, 'monthly_subscription', ?, ?, ?, ?, CURDATE(), ?, 'active')`,
            [
              userId,
              payment.amount / 10,
              orderId,
              plan.free_sms_month,
              plan.free_sms_month,
              endedAt,
            ],
          );
        }
      }

      await connection.commit();
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=success&trackId=${trackId}`,
      );
    } else {
      await connection.execute(
        "UPDATE payments SET status = 'failed' WHERE track_id = ?",
        [trackId],
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=failed&trackId=${trackId}`,
      );
    }
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Bazaar Verify Error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=failed&trackId=${trackId}`,
    );
  } finally {
    if (connection) connection.release();
  }
}
