// src/app/api/customer-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { formatPersianDate } from "@/lib/date-utils";

interface CustomerBooking {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  booking_description: string | null;
  services: string | null;
  status: "active" | "cancelled" | "done";
  change_count: number;
  customer_token: string | null;
  token_expires_at: string | null;
  created_at: string;
  business_name?: string;
  business_phone?: string;
  staff_phone?: string;
  business_address?: string;
  off_days?: string;
  work_shifts?: string;
  staff_id?: number | null;
  calendar_type?: string;
  user_id?: number;
}

// تابع ارسال پیامک مستقیم به IPPanel
async function sendSmsToBusinessOwner(
  ownerPhone: string,
  customerName: string,
  bookingDate: string,
  bookingTime: string,
  businessName: string,
  isReschedule: boolean = false,
  newDate?: string,
  newTime?: string
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
        date: isReschedule && newDate ? newDate : bookingDate,
        time: isReschedule && newTime ? newTime : bookingTime,
        service: isReschedule ? "تغییر زمان نوبت" : "درخواست نوبت جدید",
        salon: businessName,
        phone: ownerPhone,
      },
    };
    
    console.log("[SMS] ارسال به IPPanel:", {
      to: recipient,
      template: "0y9hfxw9c5b0yh3",
      isReschedule,
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

// تابع کسر اعتبار
async function deductSmsCredits(userId: number, bookingId: number, amount: number = 2): Promise<boolean> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
    
    const response = await fetch(`${appUrl}/api/sms/deduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        amount: amount,
        reason: "reschedule_request",
        booking_id: bookingId,
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`[DEDUCT] ${amount} واحد از اعتبار کاربر ${userId} کسر شد. باقیمانده: ${result.remainingBalance}`);
      return true;
    } else {
      console.log(`[DEDUCT] خطا در کسر اعتبار: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error("[DEDUCT] خطا:", error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "توکن الزامی است" },
      { status: 400 }
    );
  }

  try {
    const bookings = await query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') AS booking_time,
        b.duration_minutes,
        b.booking_description,
        b.services,
        b.status,
        b.change_count,
        b.customer_token,
        b.token_expires_at,
        b.created_at,
        b.staff_id,
        b.user_id,
        s.phone AS staff_phone,       
        u.phone AS business_phone,    
        u.business_name,
        u.business_address,
        u.off_days,
        u.work_shifts,
        s.calendar_type
      FROM booking b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN staffs s ON b.staff_id = s.id
      WHERE b.customer_token = ?
        AND b.token_expires_at > NOW()
        AND b.status IN ('active', 'done', 'cancelled')`,
      [token]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "نوبت یافت نشد یا منقضی شده" },
        { status: 404 }
      );
    }

    const booking = bookings[0] as CustomerBooking;
    const offDaysArray = booking.off_days ? JSON.parse(booking.off_days) : [];
    const workShiftsArray = booking.work_shifts ? JSON.parse(booking.work_shifts) : [];
    const maxChangeCount = 1;

    const pendingChanges = await query(
      `SELECT id FROM booking_changes 
       WHERE booking_id = ? AND request_type = 'reschedule' AND status = 'pending'`,
      [booking.id]
    );
    const hasPendingReschedule = pendingChanges.length > 0;

    const pendingCancels = await query(
      `SELECT id FROM booking_changes 
       WHERE booking_id = ? AND request_type = 'cancel' AND status = 'pending'`,
      [booking.id]
    );
    const hasPendingCancel = pendingCancels.length > 0;

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        date: booking.booking_date,
        time: booking.booking_time,
        duration: booking.duration_minutes,
        description: booking.booking_description || "",
        services: booking.services ? booking.services.split(", ") : [],
        status: booking.status,
        changeCount: booking.change_count,
        maxChangeCount: maxChangeCount,
        token: booking.customer_token,
        expiresAt: booking.token_expires_at,
        createdAt: booking.created_at,
        businessName: booking.business_name || "نام کسب‌وکار ثبت نشده",
        businessPhone: booking.business_phone || "",
        businessAddress: booking.business_address || "",
        canCancel: booking.status === "active",
        canReschedule:
          booking.status === "active" && 
          booking.change_count < maxChangeCount && 
          !hasPendingReschedule,
        offDays: offDaysArray,
        workShifts: workShiftsArray,
        staffId: booking.staff_id,
        calendarType: booking.calendar_type,
        contactPhone: booking.staff_phone || booking.business_phone || "",
        hasPendingReschedule: hasPendingReschedule,
        hasPendingCancel: hasPendingCancel,
      },
    });
  } catch (error) {
    console.error("خطا در دریافت اطلاعات نوبت:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
  console.log(`\n========== [${requestId}] درخواست مشتری ==========`);
  
  try {
    const body = await req.json();
    const { token, action, data } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "توکن الزامی است" },
        { status: 400 }
      );
    }

    // دریافت اطلاعات نوبت
    const bookings = await query(
      `SELECT 
        b.id,
        b.status,
        b.change_count,
        b.user_id,
        b.client_name,
        b.client_phone,
        b.staff_id,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') AS booking_time,
        b.duration_minutes,
        u.work_shifts,
        u.off_days,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.name as staff_name
      FROM booking b
      INNER JOIN users u ON b.user_id = u.id
      LEFT JOIN staffs s ON b.staff_id = s.id
      WHERE b.customer_token = ?
        AND b.token_expires_at > NOW()
        AND b.status = 'active'`,
      [token]
    );

    if (bookings.length === 0) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر یا منقضی شده" },
        { status: 404 }
      );
    }

    const booking = bookings[0] as any;
    const persianDate = formatPersianDate(booking.booking_date);
    const timeDisplay = booking.booking_time;

    // دریافت تنظیمات پیامک از جدول customer_links
    const smsSettings = await query<any>(
      `SELECT sms_reschedule_enabled FROM customer_links 
       WHERE user_id = ? AND is_deleted = 0 AND is_active = 1 
       LIMIT 1`,
      [booking.user_id]
    );
    
    const isRescheduleSmsEnabled = smsSettings[0]?.sms_reschedule_enabled ?? 1;
    console.log(`[${requestId}] وضعیت ارسال پیامک تغییر نوبت: ${isRescheduleSmsEnabled ? "فعال" : "غیرفعال"}`);

    // ==================== عملیات لغو نوبت ====================
    if (action === "cancel") {
      if (booking.status !== "active") {
        return NextResponse.json(
          { success: false, message: "این نوبت قابل لغو نیست" },
          { status: 400 }
        );
      }

      const cancelReason = data?.reason || "بدون دلیل";

      await query(
        `UPDATE booking 
         SET status = 'cancelled', 
             customer_token = NULL, 
             updated_at = NOW(),
             cancelled_by = 'customer',
             cancel_reason = ?
         WHERE id = ?`,
        [cancelReason, booking.id]
      );

      await query(
        `INSERT INTO booking_changes 
         (booking_id, client_name, client_phone, request_type, 
          old_date, old_time, reason, staff_id, requested_at, processed_at, status)
         VALUES (?, ?, ?, 'cancel', ?, ?, ?, ?, NOW(), NOW(), 'approved')`,
        [
          booking.id,
          booking.client_name,
          booking.client_phone,
          booking.booking_date,
          booking.booking_time,
          cancelReason,
          booking.staff_id,
        ]
      );

      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          booking.user_id,
          booking.id,
          `مشتری (${booking.client_name}) نوبت خود را برای تاریخ ${persianDate} ساعت ${timeDisplay} لغو کرد. دلیل: ${cancelReason}`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت شما با موفقیت لغو شد",
      });
    }

    // ==================== عملیات تغییر زمان نوبت ====================
    if (action === "reschedule") {
      if (booking.status !== "active") {
        return NextResponse.json(
          { success: false, message: "این نوبت قابل تغییر نیست" },
          { status: 400 }
        );
      }

      if (booking.change_count >= 1) {
        return NextResponse.json(
          {
            success: false,
            message: "تعداد مجاز تغییرات (۱ بار) تمام شده است",
          },
          { status: 400 }
        );
      }

      const existingPending = await query(
        `SELECT id FROM booking_changes 
         WHERE booking_id = ? AND request_type = 'reschedule' AND status = 'pending'`,
        [booking.id]
      );

      if (existingPending.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "درخواست تغییر زمان قبلی شما در انتظار تایید است. لطفاً صبر کنید.",
          },
          { status: 400 }
        );
      }

      const { newDate, newTime, reason } = data;
      if (!newDate || !newTime) {
        return NextResponse.json(
          { success: false, message: "تاریخ و زمان جدید الزامی است" },
          { status: 400 }
        );
      }

      // بررسی تداخل زمانی
      let conflictCheckSql = `
        SELECT id FROM booking 
        WHERE user_id = ? AND booking_date = ? AND booking_time = ? 
        AND status = 'active' AND id != ?
      `;
      let conflictParams: any[] = [
        booking.user_id,
        newDate,
        newTime,
        booking.id,
      ];

      if (booking.staff_id) {
        const calendarType = booking.calendar_type;
        if (calendarType === "independent") {
          conflictCheckSql += " AND staff_id = ?";
          conflictParams.push(booking.staff_id);
        }
      } else {
        conflictCheckSql += ` AND (
          staff_id IS NULL 
          OR staff_id IN (
            SELECT id FROM staffs 
            WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
          )
        )`;
        conflictParams.push(booking.user_id);
      }

      const conflicts = await query(conflictCheckSql, conflictParams);

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "متأسفانه این زمان در همین لحظه رزرو شده است",
          },
          { status: 400 }
        );
      }

      // ثبت درخواست تغییر زمان
      await query(
        `INSERT INTO booking_changes 
         (booking_id, client_name, client_phone, request_type, 
          old_date, old_time, new_date, new_time, reason, staff_id, requested_at)
         VALUES (?, ?, ?, 'reschedule', ?, ?, ?, ?, ?, ?, NOW())`,
        [
          booking.id,
          booking.client_name,
          booking.client_phone,
          booking.booking_date,
          booking.booking_time,
          newDate,
          newTime,
          reason || "درخواست تغییر زمان نوبت توسط مشتری",
          booking.staff_id,
        ]
      );

      // ثبت نوتیفیکیشن برای مدیر
      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'reschedule', ?, NOW())`,
        [
          booking.user_id,
          booking.id,
          `مشتری (${booking.client_name}) درخواست تغییر زمان نوبت از ${persianDate} ساعت ${timeDisplay} به تاریخ ${newDate} ساعت ${newTime} ثبت کرد.`,
        ]
      );

      // ========== کسر 2 واحد از اعتبار (همیشه و اجباری) ==========
      console.log(`[${requestId}] کسر 2 واحد از اعتبار برای درخواست تغییر...`);
      let deductSuccess = false;
      try {
        deductSuccess = await deductSmsCredits(booking.user_id, booking.id, 2);
        if (deductSuccess) {
          console.log(`[${requestId}] ✅ کسر اعتبار با موفقیت انجام شد`);
        } else {
          console.log(`[${requestId}] ⚠️ خطا در کسر اعتبار`);
        }
      } catch (deductError) {
        console.error(`[${requestId}] ⚠️ خطا در کسر اعتبار:`, deductError);
      }

      // ========== ارسال پیامک به صاحب کسب‌وکار (فقط در صورت فعال بودن) ==========
      const ownerPhone = booking.business_phone;
      const businessName = booking.business_name || "کسب‌وکار";
      
      if (isRescheduleSmsEnabled && ownerPhone) {
        console.log(`[${requestId}] 📱 ارسال پیامک به صاحب کسب‌وکار (${ownerPhone}) (فعال)...`);
        const smsResult = await sendSmsToBusinessOwner(
          ownerPhone,
          booking.client_name,
          booking.booking_date,
          booking.booking_time,
          businessName,
          true, // isReschedule
          newDate,
          newTime
        );
        
        if (smsResult.success) {
          console.log(`[${requestId}] ✅ پیامک با موفقیت ارسال شد`);
        } else {
          console.log(`[${requestId}] ❌ خطا در ارسال پیامک: ${smsResult.message}`);
        }
      } else if (!isRescheduleSmsEnabled) {
        console.log(`[${requestId}] ⚠️ ارسال پیامک تغییر نوبت غیرفعال شده است`);
      } else if (!ownerPhone) {
        console.log(`[${requestId}] ⚠️ شماره تلفن صاحب کسب‌وکار یافت نشد`);
      }

      // پیام نهایی به مشتری
      let finalMessage = "درخواست تغییر زمان نوبت با موفقیت ثبت شد. نتیجه درخواست شما از طریق پیامک اطلاع داده می‌شود.";
      
      if (!deductSuccess) {
        finalMessage += " (توجه: امکان کسر اعتبار وجود نداشت، لطفاً با پشتیبانی تماس بگیرید)";
      }

      return NextResponse.json({
        success: true,
        message: finalMessage,
        requires_approval: true,
      });
    }

    return NextResponse.json(
      { success: false, message: "عملیات نامعتبر" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("خطا در پردازش درخواست:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطای سرور" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: "متد PUT پشتیبانی نمی‌شود" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "متد DELETE پشتیبانی نمی‌شود" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, message: "متد PATCH پشتیبانی نمی‌شود" },
    { status: 405 }
  );
}