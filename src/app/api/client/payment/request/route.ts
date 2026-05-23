// src/app/api/client/payment/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { type, item_id, description } = await req.json();

  const connection = await dbPool.getConnection();

  try {
    let finalAmountToman = 0;
    let planIdentifier = null;

    // ۱. اگر قصد خرید پلن (فعال‌سازی ثبت نوبت) را دارد
    if (type === "plan") {
      // پشتیبانی از شناسه‌های مختلف پلن
      if (item_id === "pro_3months" || item_id === "pro_quarterly" || item_id === "quarterly") {
        // پلن ۳ ماهه ۲۵۸ هزار تومانی
        finalAmountToman = 258000;
        planIdentifier = "pro_3months";
      } 
      else if (item_id === "pro_monthly" || item_id === "monthly") {
        // پلن ماهانه (اگر بخواهید بعداً اضافه کنید)
        finalAmountToman = 87000;
        planIdentifier = "pro_monthly";
      }
      else {
        // اگر با آیدی عددی اومد، از دیتابیس بخوان
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
        planIdentifier = item_id;
      }
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
      "INSERT INTO payments (user_id, amount, type, item_id, status) VALUES (?, ?, ?, ?, 'pending')",
      [userId, amountInRial, type, planIdentifier || item_id]
    );
    const localPaymentId = res.insertId;

    // ========== درگاه زیبال ==========
    const zibalResponse = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: process.env.ZIBAL_CODE,
        amount: amountInRial,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/payment/verify`,
        description: description || `خرید ${type === "sms" ? "پیامک" : "فعال‌سازی ثبت نوبت به مدت 3 ماه"}`,
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
        success: true,
        trackId: zibalData.trackId,
        gatewayUrl: `https://gateway.zibal.ir/start/${zibalData.trackId}`,
      });
    } else {
      throw new Error("خطا در ایجاد تراکنش در زیبال.");
    }

  } catch (error: any) {
    console.error("Payment Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
});