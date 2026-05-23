// src/app/api/customer/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const phone = searchParams.get("phone");
    
    if (!slug || !phone) {
      return NextResponse.json({ success: false, message: "اطلاعات ناقص است" }, { status: 400 });
    }
    
    const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
    
    // دریافت نوبت‌های مشتری - فقط تاریخ به فرمت YYYY-MM-DD برگردانده شود
    const bookings = await query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as booking_time,
        b.duration_minutes,
        b.services,
        b.status,
        b.created_at,
        b.change_count,
        b.customer_token
       FROM booking b
       INNER JOIN customer_links cl ON b.user_id = cl.user_id
       WHERE cl.slug = ? AND b.client_phone = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [slug, cleanedPhone]
    );
    
    console.log("تاریخ از دیتابیس:", bookings[0]?.booking_date);
    
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    return NextResponse.json({ success: false, message: "خطا در دریافت نوبت‌ها" }, { status: 500 });
  }
}