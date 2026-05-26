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

// تابع ارسال پیامک مستقیم به IPPanel
async function sendSmsToBusinessOwner(
  ownerPhone: string,
  customerName: string,
  bookingDate: string,
  bookingTime: string,
  servicesNames: string,
  businessName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const IP_PANEL_API_KEY = process.env.IP_PANEL_API_KEY;
    const SENDER_NUMBER = process.env.SENDER_NUMBER || "+983000505";
    
    if (!IP_PANEL_API_KEY) {
      console.error("[SMS] IP_PANEL_API_KEY در env تنظیم نشده است");
      return { success: false, message: "API Key تنظیم نشده است" };
    }
    
    const cleanPhone = ownerPhone.replace(/\D/g, "").slice(-10);
    const recipient = `+98${cleanPhone}`;
    
    const payload = {
      sending_type: "pattern",
      from_number: SENDER_NUMBER,
      code: "0y9hfxw9c5b0yh3",
      recipients: [recipient],
      params: {
        name: customerName,
        date: bookingDate,
        time: bookingTime,
        service: servicesNames || "خدمات",
        salon: businessName,
        phone: ownerPhone,
      },
    };
    
    console.log("[SMS] ارسال به IPPanel:", {
      to: recipient,
      template: "0y9hfxw9c5b0yh3",
    });
    
    const response = await fetch("https://edge.ippanel.com/v1/api/send", {
      method: "POST",
      headers: {
        Authorization: IP_PANEL_API_KEY.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log("[SMS] پیامک با موفقیت ارسال شد");
      return { success: true };
    } else {
      console.error("[SMS] خطا از IPPanel:", result);
      return { success: false, message: result?.meta?.message || "خطا در ارسال" };
    }
  } catch (error) {
    console.error("[SMS] خطای شبکه:", error);
    return { success: false, message: error instanceof Error ? error.message : "خطای ناشناخته" };
  }
}

export async function POST(req: NextRequest) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
  console.log(`\n========== [${requestId}] درخواست جدید ثبت نوبت ==========`);
  
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
    
    // دریافت اطلاعات کاربر (صاحب کسب‌وکار)
    const userData = await query<any>(
      `SELECT phone, business_name, name FROM users WHERE id = ?`,
      [userId]
    );
    
    const ownerPhone = userData[0]?.phone || "";
    const businessName = userData[0]?.business_name || userData[0]?.name || "کسب‌وکار";
    
    // دریافت تنظیمات پیامک از جدول customer_links
    const smsSettings = await query<any>(
      `SELECT sms_new_booking_enabled FROM customer_links WHERE slug = ? AND user_id = ?`,
      [slug, userId]
    );
    
    const isNewBookingSmsEnabled = smsSettings[0]?.sms_new_booking_enabled ?? 1;
    console.log(`[${requestId}] وضعیت ارسال پیامک نوبت جدید: ${isNewBookingSmsEnabled ? "فعال" : "غیرفعال"}`);
    
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
    
    // شروع تراکنش
    await query('START TRANSACTION');
    
    try {
      // ثبت نوبت
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
      
      // دریافت ID نوبت
      const [bookingIdResult] = await query<any>(`SELECT LAST_INSERT_ID() as id`);
      const bookingId = bookingIdResult.id;
      
      if (!bookingId) {
        throw new Error("Failed to get booking ID");
      }
      
      // به‌روزرسانی مشتری
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
      
      // ثبت محدودیت
      await query(
        `INSERT INTO customer_booking_limits (phone, slug, last_booking_date, booking_id, created_at, updated_at)
         VALUES (?, ?, NOW(), ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         last_booking_date = NOW(),
         booking_id = VALUES(booking_id),
         updated_at = NOW()`,
        [cleanedPhone, slug, bookingId]
      );
      
      // ثبت نوتیفیکیشن
      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'new', ?, NOW())`,
        [
          userId,
          bookingId,
          `درخواست نوبت جدید از ${customer_name} برای تاریخ ${booking_date} ساعت ${booking_time}`,
        ]
      );
      
      await query('COMMIT');
      console.log(`[${requestId}] ✅ نوبت با ID ${bookingId} ثبت شد`);
      
      // ========== کسر 2 واحد از اعتبار (همیشه و اجباری) ==========
      let deductSuccess = false;
      try {
        const deductResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/sms/deduct`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            amount: 2,
            reason: "new_booking_request",
            booking_id: bookingId,
          }),
        });
        
        const deductResult = await deductResponse.json();
        if (deductResult.success) {
          deductSuccess = true;
          console.log(`[${requestId}] ✅ 2 واحد از اعتبار کسر شد. باقیمانده: ${deductResult.remainingBalance}`);
        } else {
          console.log(`[${requestId}] ⚠️ خطا در کسر اعتبار: ${deductResult.message}`);
        }
      } catch (deductError) {
        console.error(`[${requestId}] ⚠️ خطا در کسر اعتبار:`, deductError);
      }
      
      // ========== ارسال پیامک به صاحب کسب‌وکار (فقط در صورت فعال بودن) ==========
      if (isNewBookingSmsEnabled && ownerPhone) {
        console.log(`[${requestId}] 📱 ارسال پیامک به ${ownerPhone} (فعال)`);
        const smsResult = await sendSmsToBusinessOwner(
          ownerPhone,
          customer_name,
          booking_date,
          booking_time,
          servicesNames,
          businessName
        );
        
        if (smsResult.success) {
          console.log(`[${requestId}] ✅ پیامک با موفقیت ارسال شد`);
        } else {
          console.log(`[${requestId}] ❌ خطا در ارسال پیامک: ${smsResult.message}`);
        }
      } else if (!isNewBookingSmsEnabled) {
        console.log(`[${requestId}] ⚠️ ارسال پیامک نوبت جدید غیرفعال شده است`);
      } else if (!ownerPhone) {
        console.log(`[${requestId}] ⚠️ شماره تلفن صاحب کسب‌وکار یافت نشد`);
      }
      
      // پیام نهایی به مشتری
      let finalMessage = "درخواست نوبت شما ثبت شد و پس از تأیید مدیر، پیامک تأیید برای شما ارسال می‌شود";
      
      if (!deductSuccess) {
        finalMessage += " (توجه: امکان کسر اعتبار وجود نداشت، لطفاً با پشتیبانی تماس بگیرید)";
      }
      
      return NextResponse.json({
        success: true,
        message: finalMessage,
        bookingId: bookingId,
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error(`[${requestId}] ❌ خطا:`, error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "خطا در ثبت نوبت" 
    }, { status: 500 });
  }
}