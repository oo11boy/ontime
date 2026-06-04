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

    // ۱. خرید پلن اصلی اپلیکیشن
    if (type === "plan") {
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

    // ۲. خرید بسته پیامکی
    else if (type === "sms") {
      const [users]: any = await connection.execute(
        "SELECT plan_key FROM users WHERE id = ?",
        [userId]
      );
      
      if (!users || users.length === 0) {
        throw new Error("کاربر یافت نشد.");
      }
      
      const userPlanKey = users[0].plan_key;
      let pricePer100 = 0;
      
      if (userPlanKey === "free" || userPlanKey === "free_trial") {
        pricePer100 = 45000;
        console.log(`User has free plan (${userPlanKey}), using default price: ${pricePer100} تومان per 100 SMS`);
      } else {
        const [plans]: any = await connection.execute(
          "SELECT price_per_100_sms FROM plans WHERE plan_key = ?",
          [userPlanKey]
        );
        
        if (!plans || plans.length === 0) {
          throw new Error(`پلن فعلی شما (${userPlanKey}) یافت نشد.`);
        }
        
        pricePer100 = plans[0].price_per_100_sms;
      }
      
      finalAmountToman = Math.round((Number(item_id) / 100) * pricePer100);
    }

    if (finalAmountToman <= 0) throw new Error("مبلغ تراکنش محاسبه نشد.");
    const amountInRial = finalAmountToman * 10;

    // ثبت تراکنش
    const [res]: any = await connection.execute(
      "INSERT INTO payments (user_id, amount, type, item_id, status) VALUES (?, ?, ?, ?, 'pending')",
      [userId, amountInRial, type, planIdentifier || item_id]
    );
    const localPaymentId = res.insertId;

    // درگاه زیبال
    const zibalResponse = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: process.env.ZIBAL_CODE,
        amount: amountInRial,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/payment/verify`,
        description: description || `خرید ${type === "sms" ? "پیامک" : "اشتراک ${planIdentifier}"}`,
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