import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function sendSms(phone: string, code: string) {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER = process.env.SENDER_NUMBER;
  const PATTERN_CODE = "c08amdu58d226ss";

  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY || "",
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER,
        code: PATTERN_CODE,
        recipients: [formattedPhone],
        params: { code },
      }),
    });
    const result = await response.json();
    return result.meta?.status === true;
  } catch (error) {
    console.error("SMS Error:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, resend } = body;

    if (!phone || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { message: "شماره موبایل نامعتبر است." },
        { status: 400 }
      );
    }

    // --- ۱. مرحله درخواست کد ---
    if (!otp || resend) {
      const existingUser = await query<{ last_otp_at: string }>(
        "SELECT last_otp_at FROM users WHERE phone = ?",
        [phone]
      );

      if (existingUser.length > 0 && existingUser[0].last_otp_at) {
        const diff =
          Date.now() - new Date(existingUser[0].last_otp_at).getTime();
        if (diff < 120000) {
          return NextResponse.json(
            { message: "لطفاً ۲ دقیقه صبر کرده و دوباره تلاش کنید." },
            { status: 429 }
          );
        }
      }

      const realOtp = Math.floor(100000 + Math.random() * 900000).toString();

      if (existingUser.length === 0) {
        await query(
          "INSERT INTO users (phone, plan_key, otp_code, otp_expires_at, last_otp_at, otp_attempts) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE), NOW(), 0)",
          [phone, "free_trial", realOtp]
        );
      } else {
        await query(
          "UPDATE users SET otp_code = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 2 MINUTE), last_otp_at = NOW(), otp_attempts = 0 WHERE phone = ?",
          [realOtp, phone]
        );
      }

      const smsSent = await sendSms(phone, realOtp);
      if (!smsSent) {
        return NextResponse.json(
          { message: "خطا در ارسال پیامک." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "کد با موفقیت ارسال شد.",
        ...(process.env.NODE_ENV === "development" && { debug_otp: realOtp }),
      });
    }

    // --- ۲. مرحله تایید کد ---
    const users = await query<{
      id: number;
      name: string | null;
      job_id: number | null;
      otp_code: string;
      otp_attempts: number;
    }>(
      "SELECT id, name, job_id, otp_code, otp_attempts FROM users WHERE phone = ? AND otp_expires_at > NOW()",
      [phone]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "کد منقضی شده است." },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.otp_attempts >= 5) {
      return NextResponse.json(
        { message: "تعداد تلاش‌ها بیش از حد مجاز است." },
        { status: 403 }
      );
    }

    if (user.otp_code !== otp) {
      await query(
        "UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?",
        [user.id]
      );
      return NextResponse.json(
        { message: "کد تایید اشتباه است." },
        { status: 401 }
      );
    }

    // تایید موفق
    await query(
      "UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE id = ?",
      [user.id]
    );

    const token = generateToken(user.id);
    const signupComplete = !!user.name && !!user.job_id;

    const cookieStore = await cookies();

    // کوکی اصلی احراز هویت
    cookieStore.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    // کوکی کمکی برای تشخیص وضعیت ثبت‌نام در Middleware (بدون HttpOnly برای دسترسی سریع)
    cookieStore.set("is_registered", signupComplete ? "true" : "false", {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      message: "خوش آمدید",
      signup_complete: signupComplete,
    });
  } catch (error: any) {
    console.error("Critical Login Error:", error);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}
