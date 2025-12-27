import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { amount, type, item_id, description } = await req.json();

  const connection = await dbPool.getConnection();
  try {
    // ۱. ثبت اولیه در جدول لاگ پرداخت‌ها (وضعیت pending)
    // نکته: مبلغ را به ریال ذخیره می‌کنیم تا با لاگ زیبال همخوانی داشته باشد
    const [res]: any = await connection.execute(
      "INSERT INTO payments (user_id, amount, type, item_id, status) VALUES (?, ?, ?, ?, ?)",
      [userId, amount * 10, type, item_id, "pending"]
    );
    const localPaymentId = res.insertId;

    // ۲. ارسال درخواست به زیبال
    const zibalResponse = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: process.env.ZIBAL_CODE, // حتماً در زمان عملیاتی شدن کد مرچنت خود را جایگزین کنید
        amount: amount * 10, // تبدیل به ریال برای درگاه
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/payment/verify`,
        description:
          description || `خرید ${type === "sms" ? "بسته پیامک" : "پلن"}`,
        orderId: localPaymentId.toString(),
      }),
    });

    const zibalData = await zibalResponse.json();

    if (zibalData.result === 100) {
      // ۳. ذخیره trackId دریافتی از زیبال برای استفاده در مرحله Verify
      await connection.execute(
        "UPDATE payments SET track_id = ? WHERE id = ?",
        [zibalData.trackId, localPaymentId]
      );

      return NextResponse.json({
        trackId: zibalData.trackId,
        // آدرس هدایت کاربر به درگاه (در فرانت استفاده کنید)
        gatewayUrl: `https://gateway.zibal.ir/start/${zibalData.trackId}`,
      });
    } else {
      throw new Error(`خطای زیبال در ایجاد تراکنش: ${zibalData.result}`);
    }
  } catch (error: any) {
    console.error("Payment Request Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
});
