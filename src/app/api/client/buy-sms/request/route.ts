// src/app/api/client/buy-sms/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(async (req: NextRequest, context) => {
    const { userId } = context;

    try {
        const body = await req.json();
        const { amount, sms_count } = body;

        // ۱. آماده‌سازی داده‌ها برای زیبال
        const zibalData = {
            merchant: "zibal", // در حالت واقعی مرچنت کد خود را بگذارید
            amount: amount, // به ریال
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/client/buy-sms/verify`,
            description: `خرید بسته ${sms_count} عددی پیامک`,
            orderId: `SMS_${Date.now()}_${userId}`,
        };

        // ۲. ارسال درخواست به زیبال
        const response = await fetch("https://gateway.zibal.ir/v1/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(zibalData),
        });

        const result = await response.json();

        if (result.result === 100) {
            return NextResponse.json({
                trackId: result.trackId,
                paymentUrl: `https://gateway.zibal.ir/start/${result.trackId}`
            });
        } else {
            return NextResponse.json({ message: "خطا در اتصال به درگاه", status: result.result }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
});