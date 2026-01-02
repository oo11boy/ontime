import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * @method POST
 * خروج کامل از حساب کاربری
 * حذف تمامی کوکی‌های مربوط به احراز هویت و وضعیت ثبت‌نام کلاینت
 */
export async function POST() {
    try {
        const cookieStore = await cookies();

        // ۱. حذف توکن اصلی احراز هویت
        cookieStore.delete('authToken');

        // ۲. حذف کوکی وضعیت ثبت‌نام (برای هماهنگی با Middleware)
        cookieStore.delete('is_registered');

        // ۳. اگر کوکی‌های دیگری مثل مشخصات غیرحساس کاربر دارید اینجا اضافه کنید
        // cookieStore.delete('user_role');

        return NextResponse.json({ 
            success: true,
            message: 'خروج با موفقیت انجام شد و تمامی نشست‌ها پاکسازی شدند.',
        }, { 
            status: 200 
        });

    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ 
            success: false,
            message: 'خطا در عملیات خروج' 
        }, { 
            status: 500 
        });
    }
}