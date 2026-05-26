// src/app/api/client/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { PoolConnection } from "mysql2/promise";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const success = searchParams.get("success");

  let connection: PoolConnection | null = null;
  let redirectPath = ""; // متغیر برای ذخیره مسیر ریدایرکت

  try {
    connection = await dbPool.getConnection();

    if (success !== "1") {
      await connection.execute(
        "UPDATE payments SET status = ? WHERE track_id = ?",
        ["canceled", trackId]
      );
      
      // ریدایرکت به صفحه نتیجه پرداخت برای وضعیت کنسل شده
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=failed&trackId=${trackId}`
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
        
        // ریدایرکت به صفحه نتیجه پرداخت برای خرید شارژ پیامکی
        redirectPath = `/clientdashboard/payment/result?status=success&trackId=${trackId}`;
      } 
      else if (payment.type === "plan") {
        const planId = payment.item_id;
        
        // 🔥 فعال‌سازی قابلیت ثبت نوبت در لینک اختصاصی
        const isThreeMonthsPlan = (
          payment.amount === 2580000 ||
          planId === "pro_3months" || 
          planId === "pro_quarterly" || 
          planId === "quarterly"
        );
        
        let expiryDate: Date | null = null;
        
        if (isThreeMonthsPlan) {
          // دریافت لینک اختصاصی کاربر
          const [links]: any = await connection.execute(
            "SELECT id FROM customer_links WHERE user_id = ? AND is_deleted = 0 LIMIT 1",
            [userId]
          );
          
          expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 3);
          
          if (links && links.length > 0) {
            const linkId = links[0].id;
            
            await connection.execute(
              `UPDATE customer_links SET 
                booking_feature_enabled = 1,
                booking_feature_expiry = ?,
                booking_feature_payment_id = ?
              WHERE id = ?`,
              [expiryDate.toISOString().split('T')[0], payment.id, linkId]
            );
            
            console.log(`✅ قابلیت ثبت نوبت برای لینک ${linkId} فعال شد`);
          } else {
            const defaultSlug = `business_${userId}_${Date.now()}`;
            await connection.execute(
              `INSERT INTO customer_links (user_id, slug, full_url, business_name, is_active, booking_feature_enabled, booking_feature_expiry, booking_feature_payment_id, created_at) 
               VALUES (?, ?, ?, ?, 1, 1, ?, ?, NOW())`,
              [userId, defaultSlug, `c/${defaultSlug}`, "کسب‌وکار من", expiryDate.toISOString().split('T')[0], payment.id]
            );
            console.log(`✅ لینک اختصاصی جدید برای کاربر ${userId} ساخته شد`);
          }
          
          // ریدایرکت به صفحه پلن‌ها برای فعال‌سازی نوبت دهی
          redirectPath = `/clientdashboard/customer-link/plans?payment=success&trackId=${trackId}`;
        } 
        else {
          // خرید اشتراک ماهانه معمولی
          if (planId && !isNaN(Number(planId))) {
            const [plans]: any = await connection.execute(
              "SELECT * FROM plans WHERE id = ?",
              [planId]
            );
            const plan = plans?.[0];

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
                ]
              );

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
                  endedAt,
                ]
              );
            }
          }
          
          // ریدایرکت به صفحه نتیجه پرداخت برای اشتراک ماهانه
          redirectPath = `/clientdashboard/payment/result?status=success&trackId=${trackId}`;
        }
      }

      await connection.commit();
      
      // ریدایرکت به مسیر تعیین شده
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}${redirectPath}`
      );
    } 
    else {
      await connection.execute(
        "UPDATE payments SET status = ? WHERE track_id = ?",
        ["failed", trackId]
      );
      
      // ریدایرکت به صفحه نتیجه پرداخت برای وضعیت ناموفق
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=failed&trackId=${trackId}`
      );
    }
  } 
  catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Verify Error:", error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/clientdashboard/payment/result?status=failed&trackId=${trackId}`
    );
  } 
  finally {
    if (connection) connection.release();
  }
}