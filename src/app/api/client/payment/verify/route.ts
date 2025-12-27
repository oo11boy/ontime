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

    // ۱. اگر کاربر پرداخت را لغو کرده یا ناموفق بوده
    if (success !== "1") {
      await connection.execute(
        "UPDATE payments SET status = ? WHERE track_id = ?",
        ["canceled", trackId]
      );
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard?payment=failed`
      );
    }

    // ۲. استعلام نهایی از زیبال (Verify)
    const verifyRes = await fetch("https://gateway.zibal.ir/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: "zibal", // کد مرچنت واقعی خود را قرار دهید
        trackId: trackId,
      }),
    });
    const vData = await verifyRes.json();

    // ۳. اگر پرداخت توسط زیبال تایید شد
    if (vData.result === 100 && vData.status === 1) {
      await connection.beginTransaction();

      // دریافت اطلاعات تراکنش از جدول لاگ ما
      const [payInfo]: any = await connection.execute(
        "SELECT * FROM payments WHERE track_id = ? LIMIT 1",
        [trackId]
      );

      if (!payInfo || payInfo.length === 0) {
        throw new Error("تراکنش یافت نشد.");
      }

      const payment = payInfo[0];
      const userId = payment.user_id;

      // الف) آپدیت وضعیت تراکنش در جدول لاگ
      await connection.execute(
        "UPDATE payments SET status = ?, ref_number = ?, card_number = ? WHERE track_id = ?",
        ["success", vData.refNumber, vData.cardNumber, trackId]
      );

      // ب) تحویل محصول بر اساس نوع تراکنش
      if (payment.type === "sms") {
        // --- حالت خرید بسته پیامکی ---
        const smsCount = payment.item_id; // در زمان Request تعداد را در item_id ذخیره کرده بودیم

        // ۱. ثبت در تاریخچه خریدها
        await connection.execute(
          `INSERT INTO smspurchase 
                    (user_id, type, amount_paid, sms_amount, remaining_sms, valid_from, expires_at, status) 
                    VALUES (?, 'one_time_sms', ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active')`,
          [userId, payment.amount / 10, smsCount, smsCount]
        );

        // ۲. اضافه کردن مستقیم به اعتبار خریداری شده یوزر
        await connection.execute(
          "UPDATE users SET purchased_sms_credit = purchased_sms_credit + ? WHERE id = ?",
          [smsCount, userId]
        );
      } else if (payment.type === "plan") {
        // --- حالت خرید/ارتقای پلن ---
        const planId = payment.item_id;

        // ۱. دریافت اطلاعات پلن از جدول plans
        const [plans]: any = await connection.execute(
          "SELECT * FROM plans WHERE id = ?",
          [planId]
        );
        const plan = plans[0];

        if (plan) {
          const durationDays = plan.plan_key === "free_trial" ? 60 : 30;

          // ۲. آپدیت اطلاعات یوزر (پلن جدید و شارژ ماهانه)
          await connection.execute(
            `UPDATE users SET 
                        plan_key = ?, 
                        sms_balance = ?, 
                        sms_monthly_quota = ?, 
                        quota_starts_at = CURDATE(), 
                        quota_ends_at = DATE_ADD(CURDATE(), INTERVAL ? DAY)
                        WHERE id = ?`,
            [
              plan.plan_key,
              plan.free_sms_month,
              plan.free_sms_month,
              durationDays,
              userId,
            ]
          );

          // ۳. ثبت در تاریخچه خریدها
          await connection.execute(
            `INSERT INTO smspurchase 
                        (user_id, type, amount_paid, sms_amount, remaining_sms, valid_from, expires_at, status) 
                        VALUES (?, 'monthly_subscription', ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'active')`,
            [
              userId,
              payment.amount / 10,
              plan.free_sms_month,
              plan.free_sms_month,
              durationDays,
            ]
          );
        }
      }

      await connection.commit();
      // انتقال به داشبورد با پیام موفقیت
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=success&trackId=${trackId}`
      );
    } else {
      // اگر تایید نشد (مثلاً پرداخت تکراری یا تقلبی)
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
