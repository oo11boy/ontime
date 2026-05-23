// src/app/api/customer/new-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("346789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export async function POST(req: NextRequest) {
  try {
    const { slug, customer_name, customer_phone, service_ids, booking_date, booking_time, description } = await req.json();
    
    if (!slug || !customer_name || !customer_phone || !service_ids?.length || !booking_date || !booking_time) {
      return NextResponse.json({ success: false, message: "اطلاعات ناقص است" }, { status: 400 });
    }
    
    const cleanedPhone = customer_phone.replace(/\D/g, "").slice(-10);
    
    // دریافت user_id از slug
    const linkData = await query(
      `SELECT user_id FROM customer_links WHERE slug = ? AND is_active = 1`,
      [slug]
    );
    
    if (linkData.length === 0) {
      return NextResponse.json({ success: false, message: "لینک نامعتبر است" }, { status: 404 });
    }
    
    const userId = linkData[0].user_id;
    
    // دریافت اطلاعات خدمات
    const servicesList = await query(
      `SELECT * FROM user_services WHERE id IN (${service_ids.map(() => "?").join(",")}) AND user_id = ?`,
      [...service_ids, userId]
    );
    
    const servicesNames = servicesList.map((s: any) => s.name).join(", ");
    const totalDuration = servicesList.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);
    
    // توکن برای لینک مدیریت نوبت
    const customerToken = nanoid();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 14);
    
    // ثبت نوبت با status='pending' (نیاز به تأیید مدیر)
    await query(
      `INSERT INTO booking 
       (user_id, client_name, client_phone, booking_date, booking_time, 
        duration_minutes, booking_description, services, status, 
        source, customer_token, token_expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'customer_link', ?, ?, NOW())`,
      [
        userId,
        customer_name,
        cleanedPhone,
        booking_date,
        booking_time,
        totalDuration || 30,
        description || "",
        servicesNames,
        customerToken,
        tokenExpiresAt,
      ]
    );
    
    // به‌روزرسانی یا ایجاد مشتری در جدول clients
    await query(
      `INSERT INTO clients (client_name, client_phone, user_id, total_bookings, last_booking_date, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
       client_name = VALUES(client_name), 
       total_bookings = total_bookings + 1, 
       last_booking_date = VALUES(last_booking_date), 
       updated_at = NOW()`,
      [customer_name, cleanedPhone, userId, booking_date]
    );
    
    // ثبت نوتیفیکیشن برای مدیر
    await query(
      `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
       VALUES (?, LAST_INSERT_ID(), 'new', ?, NOW())`,
      [
        userId,
        `درخواست نوبت جدید از ${customer_name} برای تاریخ ${booking_date} ساعت ${booking_time}`,
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: "درخواست نوبت شما ثبت شد و پس از تأیید مدیر، پیامک تأیید برای شما ارسال می‌شود",
    });
  } catch (error) {
    console.error("Error creating new booking:", error);
    return NextResponse.json({ success: false, message: "خطا در ثبت نوبت" }, { status: 500 });
  }
}