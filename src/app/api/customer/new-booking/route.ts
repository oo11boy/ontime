// src/app/api/customer/new-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("346789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

// بررسی محدودیت یک بار در روز
async function checkDailyBookingLimit(cleanedPhone: string, slug: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    const linkData = await query<any>(
      `SELECT user_id FROM customer_links WHERE slug = ? AND is_active = 1`,
      [slug]
    );
    
    if (linkData.length === 0) {
      return { allowed: false, message: "لینک نامعتبر است" };
    }
    
    const userId = linkData[0].user_id;
    const today = new Date().toISOString().split('T')[0];
    
    const existingBookings = await query<any>(
      `SELECT COUNT(*) as count FROM booking 
       WHERE user_id = ? 
       AND client_phone = ? 
       AND booking_date = ? 
       AND status IN ('active', 'pending')
       AND DATE(created_at) = CURDATE()`,
      [userId, cleanedPhone, today]
    );
    
    if (existingBookings[0].count > 0) {
      return { 
        allowed: false, 
        message: "شما امروز قبلاً یک نوبت ثبت کرده‌اید. امکان ثبت نوبت جدید امروز وجود ندارد." 
      };
    }
    
    const limitRecord = await query<any>(
      `SELECT * FROM customer_booking_limits 
       WHERE phone = ? AND slug = ? AND DATE(last_booking_date) = CURDATE()`,
      [cleanedPhone, slug]
    );
    
    if (limitRecord.length > 0) {
      return { 
        allowed: false, 
        message: "امروز قبلاً یک نوبت ثبت کرده‌اید. لطفاً فردا مجدداً اقدام کنید." 
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error("Error checking daily limit:", error);
    return { allowed: true };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, customer_name, customer_phone, service_ids, booking_date, booking_time, description } = await req.json();
    
    if (!slug || !customer_name || !customer_phone || !service_ids?.length || !booking_date || !booking_time) {
      return NextResponse.json({ success: false, message: "اطلاعات ناقص است" }, { status: 400 });
    }
    
    const cleanedPhone = customer_phone.replace(/\D/g, "").slice(-10);
    
    // بررسی محدودیت یک بار در روز
    const limitCheck = await checkDailyBookingLimit(cleanedPhone, slug);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        success: false, 
        message: limitCheck.message,
        limitExceeded: true 
      }, { status: 429 });
    }
    
    // دریافت user_id از slug
    const linkData = await query<any>(
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
    
    // شروع تراکنش برای اطمینان از یکپارچگی داده‌ها
    await query('START TRANSACTION');
    
    try {
      // ثبت نوبت با status='pending'
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
      
      // دریافت ID نوبت ثبت شده با LAST_INSERT_ID()
      const [bookingIdResult] = await query<any>(
        `SELECT LAST_INSERT_ID() as id`
      );
      const bookingId = bookingIdResult.id;
      
      if (!bookingId) {
        throw new Error("Failed to get booking ID");
      }
      
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
      
      // ثبت محدودیت در جدول customer_booking_limits
      await query(
        `INSERT INTO customer_booking_limits (phone, slug, last_booking_date, booking_id, created_at, updated_at)
         VALUES (?, ?, NOW(), ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         last_booking_date = NOW(),
         booking_id = VALUES(booking_id),
         updated_at = NOW()`,
        [cleanedPhone, slug, bookingId]
      );
      
      // ثبت نوتیفیکیشن برای مدیر
      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'new', ?, NOW())`,
        [
          userId,
          bookingId,
          `درخواست نوبت جدید از ${customer_name} برای تاریخ ${booking_date} ساعت ${booking_time}`,
        ]
      );
      
      // اعمال تراکنش
      await query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: "درخواست نوبت شما ثبت شد و پس از تأیید مدیر، پیامک تأیید برای شما ارسال می‌شود",
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error("Error creating new booking:", error);
    return NextResponse.json({ success: false, message: "خطا در ثبت نوبت" }, { status: 500 });
  }
}