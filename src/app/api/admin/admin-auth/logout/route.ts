import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "adminAuthToken";

/**
 * @method POST
 * خروج از پنل مدیریت و پاکسازی کوکی امنیتی ادمین
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // حذف کوکی مخصوص ادمین برای قطع دسترسی Middleware
    cookieStore.delete(ADMIN_COOKIE_NAME);

    return NextResponse.json(
      {
        success: true,
        message: "خروج از پنل مدیریت با موفقیت انجام شد.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Admin Logout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "خطا در عملیات خروج از سیستم.",
      },
      {
        status: 500,
      }
    );
  }
}
