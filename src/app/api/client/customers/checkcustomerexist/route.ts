
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const url = new URL(req.url);
  const rawPhone = url.searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json(
      { message: "شماره موبایل الزامی است" },
      { status: 400 }
    );
  }

  // استانداردسازی شماره تلفن (حذف ۰ اول برای جستجوی منعطف‌تر)
  const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10);
  const phoneWithZero = "0" + cleanPhone;
  const phoneWithoutZero = cleanPhone;

  try {
    // ۱. جستجو در جدول clients (برای بررسی وضعیت مسدودیت و اطلاعات پایه)
    const clientResult: any = await query(
      `SELECT id, client_name, total_bookings, last_booking_date, is_blocked 
       FROM clients 
       WHERE user_id = ? AND (client_phone = ? OR client_phone = ?) 
       LIMIT 1`,
      [userId, phoneWithZero, phoneWithoutZero]
    );
    
    const clientFromTable = Array.isArray(clientResult) ? clientResult[0] : null;

    // ۲. دریافت آمار لغو نوبت از جدول booking (برای نمایش هشدار مسدودیت در فرانت)
    const bookingStats: any = await query(
      `SELECT 
          COUNT(*) as total_bookings,
          MAX(booking_date) as last_date,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
       FROM booking 
       WHERE user_id = ? AND (client_phone = ? OR client_phone = ?)`,
      [userId, phoneWithZero, phoneWithoutZero]
    );
    
    const stats = Array.isArray(bookingStats) ? bookingStats[0] : { total_bookings: 0, cancelled_count: 0 };

    // اگر هیچ رکوردی در هیچ‌کدام نبود
    if (!clientFromTable && stats.total_bookings === 0) {
      return NextResponse.json({ 
        exists: false, 
        message: "مشتری جدید است" 
      });
    }

    // پاسخ هماهنگ با فرانت‌اِند
    return NextResponse.json({
      exists: true,
      client: {
        id: clientFromTable?.id || null,
        name: clientFromTable?.client_name || "مشتری بدون نام",
        client_name: clientFromTable?.client_name || "مشتری بدون نام", // برای هماهنگی با پروپ‌های مدال
        total_bookings: clientFromTable?.total_bookings || stats.total_bookings,
        last_booking_date: clientFromTable?.last_booking_date || stats.last_date,
        is_blocked: clientFromTable?.is_blocked || 0,
        cancelled_count: stats.cancelled_count || 0,
        source: clientFromTable ? "clients_table" : "booking_history"
      },
      message: "اطلاعات مشتری بازیابی شد"
    });

  } catch (error) {
    console.error("Error checking client:", error);
    return NextResponse.json(
      { message: "خطای سرور در بررسی اطلاعات مشتری" },
      { status: 500 }
    );
  }
});