import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

const MOCK_OTP = "123456"; // کد تست ثابت برای ادمین
const ADMIN_COOKIE_NAME = "adminAuthToken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, resend } = body;

    if (!phone) {
      return NextResponse.json(
        { message: "شماره موبایل الزامی است." },
        { status: 400 }
      );
    }

    // ۱. بررسی وجود ادمین در دیتابیس
    const admins = await query<{
      id: number;
      name: string;
      role: string;
    }>("SELECT id, name, role FROM admins WHERE phone = ?", [phone]);

    if (admins.length === 0) {
      return NextResponse.json(
        {
          message: "دسترسی غیرمجاز: این شماره در لیست مدیران نیست.",
        },
        { status: 403 }
      );
    }

    const adminUser = admins[0];

    // ۲. مرحله درخواست کد (فقط نمایش پیام موفقیت چون کد ثابت است)
    if (!otp || resend) {
      return NextResponse.json({
        message: "کد تأیید به شماره ادمین ارسال شد (کد تست: 123456)",
        // ارسال کد در پاسخ فقط برای راحتی در محیط توسعه است
        debug_otp: MOCK_OTP,
      });
    }

    // ۳. مرحله تأیید کد تست
    if (otp !== MOCK_OTP) {
      return NextResponse.json(
        { message: "کد وارد شده صحیح نیست." },
        { status: 401 }
      );
    }

    // ۴. ساخت توکن مدیریت
    const token = generateToken(adminUser.id);

    // ۵. تنظیم کوکی مدیریت
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // ۷ روز
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      message: `خوش آمدید جناب ${adminUser.name}`,
      role: adminUser.role,
    });
  } catch (error: any) {
    console.error("Admin Auth Error:", error);
    return NextResponse.json(
      { message: "خطای سرور در بخش مدیریت." },
      { status: 500 }
    );
  }
}
