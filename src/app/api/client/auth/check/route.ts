import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/**
 * @method GET
 * بررسی وضعیت لاگین و همگام‌سازی وضعیت ثبت‌نام با کوکی جهت استفاده در Middleware
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const userId = verifyToken(token);

    if (!userId) {
      // توکن نامعتبر یا منقضی است؛ پاکسازی کوکی‌ها
      cookieStore.delete("authToken");
      cookieStore.delete("is_registered");
      return NextResponse.json(
        { isAuthenticated: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // خواندن آخرین وضعیت از دیتابیس
    const users = await query<{ job_id: number | null; name: string | null }>(
      "SELECT job_id, name FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      cookieStore.delete("authToken");
      cookieStore.delete("is_registered");
      return NextResponse.json(
        { isAuthenticated: false, message: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];
    const signupComplete = !!user.name && !!user.job_id;

    // همگام‌سازی کوکی is_registered برای Middleware
    // این کار باعث می‌شود اگر کاربر نامش را تغییر داد، Middleware بلافاصله متوجه شود
    cookieStore.set("is_registered", signupComplete ? "true" : "false", {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      {
        isAuthenticated: true,
        signupComplete: signupComplete,
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { isAuthenticated: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
