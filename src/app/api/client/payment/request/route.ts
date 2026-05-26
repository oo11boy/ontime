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
      // ابتدا پلن کاربر را دریافت کن
      const [users]: any = await connection.execute(
        "SELECT plan_key FROM users WHERE id = ?",
        [userId]
      );
      
      if (!users || users.length === 0) {
        throw new Error("کاربر یافت نشد.");
      }
      
      const userPlanKey = users[0].plan_key;
      
      // قیمت پیش‌فرض برای پلن‌های رایگان (price per 100 SMS)
      let pricePer100 = 0;
      
      // اگر کاربر پلن رایگان دارد، از قیمت پیش‌فرض استفاده کن
      if (userPlanKey === "free" || userPlanKey === "free_trial") {
    
        pricePer100 = 45000; // 5,000 تومان به ازای هر 100 پیامک
        console.log(`User has free plan (${userPlanKey}), using default price: ${pricePer100} تومان per 100 SMS`);
      } else {
        // برای پلن‌های پولی، از دیتابیس بخوان
        const [plans]: any = await connection.execute(
          "SELECT price_per_100_sms FROM plans WHERE plan_key = ?",
          [userPlanKey]
        );
        
        if (!plans || plans.length === 0) {
          throw new Error(`پلن فعلی شما (${userPlanKey}) یافت نشد.`);
        }
        
        pricePer100 = plans[0].price_per_100_sms;
      }
      
      // محاسبه مبلغ نهایی
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