// src/app/api/client/payment/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { type, item_id, description, platform } = await req.json();

  const connection = await dbPool.getConnection();

  try {
    let finalAmountToman = 0;

    // ۱. اگر قصد خرید پلن (ارتقای اشتراک) را دارد
    if (type === "plan") {
      // پشتیبانی از هر دو نوع (id عددی یا plan_key رشته)
      let query = "";
      let params: any[] = [];
      
      if (typeof item_id === "number" || !isNaN(Number(item_id))) {
        query = "SELECT monthly_fee FROM plans WHERE id = ?";
        params = [Number(item_id)];
      } else {
        query = "SELECT monthly_fee FROM plans WHERE plan_key = ?";
        params = [item_id];
      }
      
      const [plans]: any = await connection.execute(query, params);
      if (!plans || plans.length === 0) throw new Error("پلن معتبر نیست.");
      finalAmountToman = plans[0].monthly_fee;
    }

    // ۲. اگر قصد خرید بسته پیامکی (sms) را دارد
    else if (type === "sms") {
      const userPlanSql = `
        SELECT p.price_per_100_sms 
        FROM users u 
        JOIN plans p ON u.plan_key = p.plan_key 
        WHERE u.id = ?
      `;
      const [results]: any = await connection.execute(userPlanSql, [userId]);

      if (!results || results.length === 0) {
        throw new Error("پلن فعلی شما یافت نشد.");
      }

      const pricePer100 = results[0].price_per_100_sms;
      finalAmountToman = Math.round((Number(item_id) / 100) * pricePer100);
    }

    if (finalAmountToman <= 0) throw new Error("مبلغ تراکنش محاسبه نشد.");
    const amountInRial = finalAmountToman * 10;

    // ۳. ثبت تراکنش در جدول لاگ پرداخت‌ها
    const [res]: any = await connection.execute(
      "INSERT INTO payments (user_id, amount, type, item_id, status, gateway) VALUES (?, ?, ?, ?, 'pending', ?)",
      [userId, amountInRial, type, item_id, platform === 'bazaar_webview' ? 'cafebazaar' : 'zibal']
    );
    const localPaymentId = res.insertId;

    // ========== درگاه کافه بازار ==========
    if (platform === 'bazaar_webview') {
      const trackId = localPaymentId.toString();
      await connection.execute(
        "UPDATE payments SET track_id = ? WHERE id = ?",
        [trackId, localPaymentId]
      );

      // ساخت SKU بر اساس نوع و آیتم
      let sku = '';
      if (type === 'sms') sku = `sms_package_${item_id}`;
      if (type === 'plan') sku = `${item_id}`;  // می‌تواند basic, gold, diamond باشد

      return NextResponse.json({
        gateway: 'cafebazaar',
        trackId: trackId,
        sku: sku,
        packageName: process.env.NEXT_PUBLIC_BAZAAR_PACKAGE_NAME || 'ir.ontime.app',
      });
    }

    // ========== درگاه زیبال ==========
    else {
      const zibalResponse = await fetch("https://gateway.zibal.ir/v1/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant: process.env.ZIBAL_CODE,
          amount: amountInRial,
          callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/payment/verify`,
          description: description || `خرید ${type === "sms" ? "پیامک" : "پلن"}`,
          orderId: localPaymentId.toString(),
        }),
      });

      const zibalData = await zibalResponse.json();

      if (zibalData.result === 100) {
        await connection.execute(
          "UPDATE payments SET track_id = ? WHERE id = ?",
          [zibalData.trackId, localPaymentId]
        );

        return NextResponse.json({
          gateway: 'zibal',
          trackId: zibalData.trackId,
          gatewayUrl: `https://gateway.zibal.ir/start/${zibalData.trackId}`,
        });
      } else {
        throw new Error("خطا در ایجاد تراکنش در زیبال.");
      }
    }

  } catch (error: any) {
    console.error("Payment Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
});