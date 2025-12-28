import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { type, item_id, description } = await req.json();

  const connection = await dbPool.getConnection();

  try {
    let finalAmountToman = 0;

    // ۱. اگر قصد خرید پلن (ارتقای اشتراک) را دارد
    if (type === "plan") {
      const [plans]: any = await connection.execute(
        "SELECT monthly_fee FROM plans WHERE id = ?",
        [item_id]
      );
      if (!plans || plans.length === 0) throw new Error("پلن معتبر نیست.");
      finalAmountToman = plans[0].monthly_fee;
    }

    // ۲. اگر قصد خرید بسته پیامکی (sms) را دارد
    else if (type === "sms") {
      // ابتدا پلن فعلی کاربر را پیدا می‌کنیم تا نرخ پیامک را استخراج کنیم
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
      // محاسبه مبلغ: (تعداد پیامک ارسالی کلاینت / 100) * نرخ پیامک پلن کاربر
      finalAmountToman = Math.round((Number(item_id) / 100) * pricePer100);
    }

    if (finalAmountToman <= 0) throw new Error("مبلغ تراکنش محاسبه نشد.");

    const amountInRial = finalAmountToman * 10;

    // ۳. ثبت تراکنش در جدول لاگ پرداخت‌ها
    const [res]: any = await connection.execute(
      "INSERT INTO payments (user_id, amount, type, item_id, status) VALUES (?, ?, ?, ?, 'pending')",
      [userId, amountInRial, type, item_id]
    );
    const localPaymentId = res.insertId;

    // ۴. ارسال درخواست به زیبال
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
        trackId: zibalData.trackId,
        gatewayUrl: `https://gateway.zibal.ir/start/${zibalData.trackId}`,
      });
    } else {
      throw new Error("خطا در ایجاد تراکنش در زیبال.");
    }
  } catch (error: any) {
    console.error("Payment Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
});
