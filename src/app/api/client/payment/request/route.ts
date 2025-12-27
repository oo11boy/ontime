import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { amount, type, item_id, description } = await req.json();

  const connection = await dbPool.getConnection();
  try {
    // ۱. ثبت در جدول لاگ پرداخت‌ها
    const [res]: any = await connection.execute(
      "INSERT INTO payments (user_id, amount, type, item_id, status) VALUES (?, ?, ?, ?, ?)",
      [userId, amount * 10, type, item_id, "pending"] // مبلغ دریافتی (تومان) به ریال تبدیل می‌شود
    );
    const localPaymentId = res.insertId;

    // ۲. ارسال درخواست به زیبال
    const zibalResponse = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: "zibal", // در درگاه واقعی کد خود را بگذارید
        amount: amount * 10,
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/payment/verify`,
        description: description,
        orderId: localPaymentId.toString(),
      }),
    });

    const zibalData = await zibalResponse.json();

    if (zibalData.result === 100) {
      await connection.execute(
        "UPDATE payments SET track_id = ? WHERE id = ?",
        [zibalData.trackId, localPaymentId]
      );
      return NextResponse.json({ trackId: zibalData.trackId });
    }
    throw new Error(`خطای زیبال: ${zibalData.result}`);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
});
