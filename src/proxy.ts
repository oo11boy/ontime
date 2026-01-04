import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ۱. دریافت کوکی‌های احراز هویت
  const clientToken = request.cookies.get("authToken")?.value;
  const isRegistered = request.cookies.get("is_registered")?.value;
  const adminToken = request.cookies.get("adminAuthToken")?.value; // هماهنگ با API ادمین

  // --- وضعیت الف: مدیریت صفحات لاگین (جلوگیری از ورود مجدد) ---

  // اگر کاربر کلاینت لاگین است و می‌خواهد به صفحه لاگین برود
  if (pathname === "/login" && clientToken) {
    if (isRegistered === "true") {
      return NextResponse.redirect(new URL("/clientdashboard", request.url));
    }
    // اگر ثبت‌نام ناقص است (isRegistered === "false")، اجازه بده وارد صفحه لاگین بشه تا مرحله signup رو ببینه
  }

  // اگر ادمین لاگین است و می‌خواهد به صفحه لاگین ادمین برود
  if (pathname === "/admin-login" && adminToken) {
    return NextResponse.redirect(new URL("/admindashboard", request.url));
  }

  // --- وضعیت ب: حفاظت از مسیرهای پنل کلاینت (داشبورد کلاینت) ---
  if (pathname.startsWith("/clientdashboard")) {
    // ۱. اگر اصلاً لاگین نیست
    if (!clientToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // ۲. اگر لاگین هست ولی پروفایل (نام و شغل) را تکمیل نکرده
    if (isRegistered === "false") {
      return NextResponse.redirect(new URL("/login?step=signup", request.url));
    }
  }

  // --- وضعیت ج: حفاظت از مسیرهای پنل ادمین (داشبورد مدیریت) ---
  if (pathname.startsWith("/admindashboard")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
  }

  return NextResponse.next();
}

// لیست تمام مسیرهایی که Middleware باید روی آن‌ها نظارت کند
export const config = {
  matcher: [
    "/login",
    "/admin-login",
    "/clientdashboard/:path*",
    "/admindashboard/:path*",
  ],
};
