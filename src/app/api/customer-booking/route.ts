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

    // بررسی وجود درخواست تغییر در انتظار تایید
    const pendingChanges = await query(
      `SELECT id FROM booking_changes 
       WHERE booking_id = ? AND request_type = 'reschedule' AND status = 'pending'`,
      [booking.id]
    );
    const hasPendingReschedule = pendingChanges.length > 0;

    // بررسی درخواست لغو در انتظار تایید (فقط برای تغییر زمان، لغو مستقیم است)
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

    // ==================== عملیات لغو نوبت (مستقیم، بدون نیاز به تایید) ====================
    if (action === "cancel") {
      if (booking.status !== "active") {
        return NextResponse.json(
          { success: false, message: "این نوبت قابل لغو نیست" },
          { status: 400 }
        );
      }

      const cancelReason = data?.reason || "بدون دلیل";

      // لغو مستقیم نوبت در دیتابیس
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

      // ثبت در جدول booking_changes برای تاریخچه
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

      // ثبت نوتیفیکیشن برای مدیر
      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          booking.user_id,
          booking.id,
          `مشتری (${booking.client_name}) نوبت خود را برای تاریخ ${persianDate} ساعت ${timeDisplay} لغو کرد. دلیل: ${cancelReason}`,
        ]
      );

      // ثبت در smslog برای تاریخچه پیامک (اختیاری)
      await query(
        `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at)
         VALUES (?, ?, ?, 'cancellation', 'sent', NOW())`,
        [
          booking.user_id,
          booking.client_phone,
          `نوبت شما در ${booking.business_name} لغو شد. تاریخ: ${persianDate} - زمان: ${timeDisplay}`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت شما با موفقیت لغو شد",
      });
    }

    // ==================== عملیات تغییر زمان نوبت (نیاز به تایید مدیر) ====================
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

      // بررسی وجود درخواست تغییر در انتظار تایید قبلی
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

      // ثبت درخواست تغییر زمان در جدول booking_changes
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
          `مشتری (${booking.client_name}) درخواست تغییر زمان نوبت از ${persianDate} ساعت ${timeDisplay} به تاریخ جدید ثبت کرد.`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "درخواست تغییر زمان نوبت با موفقیت ثبت شد. نتیجه درخواست شما از طریق پیامک اطلاع داده می‌شود.",
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

// برای متدهای دیگر که پشتیبانی نمی‌شوند
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