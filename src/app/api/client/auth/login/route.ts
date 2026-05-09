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

    // === بررسی اولیه: آیا این شماره پرسنل است؟ ===
    const staff = await query<any[]>(
      "SELECT id, name, owner_user_id FROM staffs WHERE phone = ? AND is_active = 1",
      [phone]
    );
    const isStaff = staff.length > 0;
    const staffData = isStaff ? staff[0] : null;

    // --- ۱. مرحله درخواست کد ---
    if (!otp || resend) {
      const realOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // ذخیره در users
      const existingUser = await query<any[]>("SELECT id FROM users WHERE phone = ?", [phone]);
      
      if (existingUser.length === 0) {
        await query(
          "INSERT INTO users (phone, plan_key, otp_code, otp_expires_at, last_otp_at, otp_attempts) VALUES (?, 'free_trial', ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), NOW(), 0)",
          [phone, realOtp]
        );
      } else {
        await query(
          "UPDATE users SET otp_code = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE), last_otp_at = NOW(), otp_attempts = 0 WHERE phone = ?",
          [realOtp, phone]
        );
      }

      // اگر پرسنل است
      if (isStaff) {
        const staffExists = await query<any[]>("SELECT id FROM staffs WHERE phone = ?", [phone]);
        if (staffExists.length > 0) {
          await query(
            "UPDATE staffs SET otp_code = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE), last_otp_at = NOW() WHERE phone = ?",
            [realOtp, phone]
          );
        }
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
    
    // اول بررسی پرسنل
    if (isStaff) {
      const staffWithOtp = await query<any[]>(
        `SELECT s.*, u.id as owner_id, u.name as owner_name
         FROM staffs s
         LEFT JOIN users u ON s.owner_user_id = u.id
         WHERE s.phone = ? AND s.otp_code = ? AND s.otp_expires_at > NOW() AND s.is_active = 1`,
        [phone, otp]
      );

      if (staffWithOtp.length > 0) {
        const staffData2 = staffWithOtp[0];
        
        await query(
          "UPDATE staffs SET otp_code = NULL, otp_expires_at = NULL, last_otp_at = NULL WHERE id = ?",
          [staffData2.id]
        );

        let userId = staffData2.owner_id;
        
        if (!userId || userId === 0) {
          const insertResult = await query<any>(
            "INSERT INTO users (phone, plan_key, name, last_otp_at) VALUES (?, 'free_trial', ?, NOW())",
            [phone, staffData2.name]
          );
          userId = insertResult.insertId;
          
          await query(
            "UPDATE staffs SET owner_user_id = ? WHERE id = ?",
            [userId, staffData2.id]
          );
        }

        await query(
          "UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE phone = ?",
          [phone]
        );

        const token = generateToken(userId);
        const cookieStore = await cookies();

        cookieStore.set("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        cookieStore.set("is_registered", "true", {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        cookieStore.set("user_type", "staff", {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        cookieStore.set("staff_id", staffData2.id.toString(), {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        cookieStore.set("staff_name", staffData2.name, {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        return NextResponse.json({
          message: "خوش آمدید",
          signup_complete: true,
          userType: "staff",
        });
      }
    }

    // بررسی کاربر عادی
    const users = await query<any[]>(
      "SELECT id, name, job_id, otp_code, otp_attempts FROM users WHERE phone = ? AND otp_expires_at > NOW()",
      [phone]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "کد منقضی شده است. دوباره درخواست کنید." },
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

    await query(
      "UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE id = ?",
      [user.id]
    );

    const token = generateToken(user.id);
    const signupComplete = !!user.name && !!user.job_id;
    const cookieStore = await cookies();

    cookieStore.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    cookieStore.set("is_registered", signupComplete ? "true" : "false", {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    cookieStore.set("user_type", "user", {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      message: "خوش آمدید",
      signup_complete: signupComplete,
      userType: "user",
    });
  } catch (error: any) {
    console.error("Critical Login Error:", error);
    return NextResponse.json({ message: "خطای سرور." }, { status: 500 });
  }
}