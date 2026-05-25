// src/app/api/client/booking-changes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { formatPersianDate } from "@/lib/date-utils";
import moment from "moment-jalaali";

// تابع فرمت کردن زمان (حذف ثانیه)
const formatTimeOnly = (time: string): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return time;
};

// ==================== توابع تبدیل تاریخ اصلاح شده ====================

// تبدیل تاریخ میلادی به شمسی برای نمایش (بدون تغییر در ذخیره‌سازی)
const convertToPersianDateForDisplay = (dateStr: string): string => {
  if (!dateStr) return "";
  
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const jDate = moment(date);
      
      if (!jDate.isValid()) return dateStr;
      
      const jYear = jDate.jYear();
      const jMonth = jDate.jMonth();
      const jDay = jDate.jDate();
      
      const persianMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ];
      
      return `${jDay} ${persianMonths[jMonth]} ${jYear}`;
    }
    return dateStr;
  } catch (error) {
    return dateStr;
  }
};

// تبدیل تاریخ میلادی به شمسی برای پیامک (فرمت: YYYY/MM/DD)
const convertToPersianDateForSMS = (dateStr: string): string => {
  if (!dateStr) return "";
  
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      const jDate = moment(date);
      
      if (!jDate.isValid()) return dateStr;
      
      const jYear = jDate.jYear();
      const jMonth = jDate.jMonth() + 1;
      const jDay = jDate.jDate();
      
      return `${jYear}/${jMonth.toString().padStart(2, "0")}/${jDay.toString().padStart(2, "0")}`;
    }
    return dateStr;
  } catch (error) {
    return dateStr;
  }
};

// الگوهای پیامک
const PATTERNS = {
  APPROVED: "q40uuerggl4qodq",
  REJECTED: "eowphltmynwerv6",
  NEW_BOOKING_APPROVED: "dtqxphdv9epu14v",
};

// تابع ارسال پیامک نتیجه درخواست تغییر یا لغو
async function sendChangeNotification(
  customerPhone: string,
  customerName: string,
  status: "approved" | "rejected",
  salonName: string,
  contactPhone: string,
  newDate: string | null,
  newTime: string | null,
  req: NextRequest,
) {
  const patternCode =
    status === "approved" ? PATTERNS.APPROVED : PATTERNS.REJECTED;
  const messageCount = 2;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    "https://ontimeapp.ir";

  let params: Record<string, string> = {
    salon: salonName,
  };

  if (status === "approved" && newDate && newTime) {
    const persianDate = convertToPersianDateForSMS(newDate);
    const formattedTime = formatTimeOnly(newTime);
    params.date = persianDate;
    params.time = formattedTime;
  } else if (status === "rejected") {
    params.phone = contactPhone;
  }

  try {
    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        to_phone: customerPhone,
        sms_type: "booking_change_notification",
        template_key: patternCode,
        message_count: messageCount,
        name: customerName || "کاربر گرامی",
        salon: salonName,
        date: params.date,
        time: params.time,
        phone: params.phone,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error sending change notification SMS:", error);
    return false;
  }
}

// تابع ارسال پیامک تأیید نوبت جدید
async function sendNewBookingApprovalSMS(
  customerPhone: string,
  customerName: string,
  salonName: string,
  bookingDate: string,
  bookingTime: string,
  req: NextRequest,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    "https://ontimeapp.ir";

  const persianDate = convertToPersianDateForSMS(bookingDate);
  const formattedTime = formatTimeOnly(bookingTime);

  try {
    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        to_phone: customerPhone,
        sms_type: "new_booking_approved",
        template_key: PATTERNS.NEW_BOOKING_APPROVED,
        message_count: 1,
        name: customerName || "کاربر گرامی",
        salon: salonName,
        date: persianDate,
        time: formattedTime,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error sending new booking approval SMS:", error);
    return false;
  }
}

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    let allRequests: any[] = [];

    // ========== 1. دریافت درخواست‌های تغییر و لغو از booking_changes ==========
    let changesSql = `
      SELECT 
        bc.id,
        bc.booking_id,
        bc.client_name,
        bc.client_phone,
        bc.request_type,
        DATE_FORMAT(bc.old_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(bc.old_time, '%H:%i') as old_time,
        DATE_FORMAT(bc.new_date, '%Y-%m-%d') as new_date,
        TIME_FORMAT(bc.new_time, '%H:%i') as new_time,
        bc.reason,
        bc.admin_reason,
        bc.status,
        bc.requested_at,
        bc.processed_at,
        bc.staff_id,
        b.cancelled_by,
        b.cancel_reason,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone
      FROM booking_changes bc
      JOIN booking b ON bc.booking_id = b.id
      LEFT JOIN staffs s ON bc.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const changesParams: any[] = [];

    if (userType === "staff" && staffId) {
      changesSql += " AND b.staff_id = ?";
      changesParams.push(parseInt(staffId));
    } else {
      changesSql += ` AND b.user_id = ?`;
      changesParams.push(userId);
    }

    const changes = await query(changesSql, changesParams);
    allRequests.push(...changes);

    // ========== 2. دریافت درخواست‌های ثبت نوبت جدید (pending از لینک مشتری) ==========
    let newBookingsSql = `
      SELECT 
        b.id as booking_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as old_time,
        NULL as new_date,
        NULL as new_time,
        b.booking_description as reason,
        NULL as admin_reason,
        b.status,
        b.created_at as requested_at,
        NULL as processed_at,
        b.staff_id,
        NULL as cancelled_by,
        NULL as cancel_reason,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone,
        'new_booking' as request_type
      FROM booking b
      LEFT JOIN staffs s ON b.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending' 
        AND b.source = 'customer_link'
    `;

    const newBookingsParams: any[] = [];

    if (userType === "staff" && staffId) {
      newBookingsSql += " AND b.staff_id = ?";
      newBookingsParams.push(parseInt(staffId));
    } else {
      newBookingsSql += ` AND b.user_id = ?`;
      newBookingsParams.push(userId);
    }

    const newBookings = await query(newBookingsSql, newBookingsParams);

    const formattedNewBookings = newBookings.map((booking: any) => ({
      id: booking.booking_id,
      booking_id: booking.booking_id,
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      request_type: "new_booking",
      old_date: booking.old_date,
      old_time: booking.old_time,
      new_date: null,
      new_time: null,
      reason: booking.reason,
      admin_reason: null,
      status: booking.status,
      requested_at: booking.requested_at,
      processed_at: null,
      staff_id: booking.staff_id,
      staff_name: booking.staff_name,
      business_name: booking.business_name,
      business_phone: booking.business_phone,
      calendar_type: booking.calendar_type,
      staff_phone: booking.staff_phone,
      cancelled_by: null,
      service_name: booking.service_name,
      services: booking.services,
    }));

    allRequests.push(...formattedNewBookings);

    // ========== 3. اضافه کردن نوبت‌هایی که مستقیماً توسط ادمین لغو شده‌اند ==========
    let directlyCancelledSql = `
      SELECT 
        b.id as booking_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as old_time,
        NULL as new_date,
        NULL as new_time,
        b.cancel_reason as reason,
        NULL as admin_reason,
        'approved' as status,
        b.updated_at as requested_at,
        b.updated_at as processed_at,
        b.staff_id,
        b.cancelled_by,
        b.service_name,
        b.services,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone,
        'cancel' as request_type
      FROM booking b
      LEFT JOIN staffs s ON b.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'cancelled'
        AND b.cancelled_by IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM booking_changes bc 
          WHERE bc.booking_id = b.id AND bc.request_type = 'cancel'
        )
    `;
    const directlyCancelledParams: any[] = [];

    if (userType === "staff" && staffId) {
      directlyCancelledSql += " AND b.staff_id = ?";
      directlyCancelledParams.push(parseInt(staffId));
    } else {
      directlyCancelledSql += ` AND b.user_id = ?`;
      directlyCancelledParams.push(userId);
    }

    const directlyCancelled = await query(
      directlyCancelledSql,
      directlyCancelledParams,
    );
    allRequests.push(...directlyCancelled);

    allRequests.sort((a, b) => {
      return (
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
    });

    return NextResponse.json({ success: true, changes: allRequests });
  } catch (error) {
    console.error("Error fetching booking changes:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت درخواست‌ها" },
      { status: 500 },
    );
  }
});

export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    const body = await req.json();
    const { id, action, reason, booking_id } = body;

    // ==================== لغو مستقیم نوبت توسط مدیر ====================
    if (action === "direct_cancel" && booking_id) {
      const bookingData: any[] = await query(
        `SELECT b.*, u.business_name, u.phone as business_phone, s.name as staff_name
         FROM booking b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN staffs s ON b.staff_id = s.id
         WHERE b.id = ? AND b.user_id = ? AND b.status = 'active'`,
        [booking_id, userId]
      );

      if (bookingData.length === 0) {
        return NextResponse.json(
          { success: false, message: "نوبت یافت نشد یا قابل لغو نیست" },
          { status: 404 }
        );
      }

      const booking = bookingData[0];
      const persianDate = formatPersianDate(booking.booking_date);
      const timeDisplay = booking.booking_time;

      await query(
        `UPDATE booking 
         SET status = 'cancelled', 
             customer_token = NULL, 
             updated_at = NOW(),
             cancelled_by = 'admin',
             cancel_reason = ?
         WHERE id = ?`,
        [reason || "لغو توسط مدیر", booking_id]
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
          reason || "لغو توسط مدیر",
          booking.staff_id,
        ]
      );

      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          userId,
          booking.id,
          `نوبت ${booking.client_name} در تاریخ ${persianDate} ساعت ${timeDisplay} توسط مدیر لغو شد.`,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "نوبت با موفقیت لغو شد",
      });
    }

    // ==================== تایید یا رد درخواست‌های موجود ====================
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 },
      );
    }

    // بررسی در booking_changes
    const changeFromChanges: any[] = await query(
      `SELECT bc.*, 
              b.user_id, 
              b.staff_id, 
              b.client_name, 
              b.client_phone, 
              b.booking_date, 
              b.booking_time,
              u.business_name, 
              u.phone as business_phone,
              s.calendar_type, 
              s.phone as staff_phone, 
              s.name as staff_name
       FROM booking_changes bc
       JOIN booking b ON bc.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN staffs s ON b.staff_id = s.id
       WHERE bc.id = ?`,
      [id],
    );

    let isFromChanges = changeFromChanges.length > 0;
    let change: any = isFromChanges ? changeFromChanges[0] : null;

    // بررسی در booking (درخواست نوبت جدید)
    if (!isFromChanges) {
      const newBookingRequest: any[] = await query(
        `SELECT 
          b.id as booking_id,
          b.user_id,
          b.staff_id,
          b.client_name,
          b.client_phone,
          b.booking_date,
          b.booking_time,
          b.booking_description as reason,
          b.status,
          u.business_name,
          u.phone as business_phone,
          s.calendar_type,
          s.phone as staff_phone,
          s.name as staff_name
        FROM booking b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN staffs s ON b.staff_id = s.id
        WHERE b.id = ? AND b.status = 'pending' AND b.source = 'customer_link'`,
        [id],
      );

      if (newBookingRequest.length > 0) {
        change = {
          ...newBookingRequest[0],
          request_type: "new_booking",
          old_date: newBookingRequest[0].booking_date,
          old_time: newBookingRequest[0].booking_time,
          new_date: null,
          new_time: null,
        };
        isFromChanges = false;
      }
    }

    if (!change) {
      return NextResponse.json(
        { success: false, message: "درخواست یافت نشد" },
        { status: 404 },
      );
    }

    // بررسی دسترسی
    if (userType === "staff" && staffId) {
      if (change.staff_id !== parseInt(staffId)) {
        return NextResponse.json(
          { success: false, message: "شما به این درخواست دسترسی ندارید" },
          { status: 403 },
        );
      }
    } else {
      const isOwnerBooking = change.user_id === userId;
      const isSyncedStaffBooking =
        change.staff_id && change.calendar_type === "synced";
      if (!isOwnerBooking && !isSyncedStaffBooking) {
        return NextResponse.json(
          { success: false, message: "شما به این درخواست دسترسی ندارید" },
          { status: 403 },
        );
      }
    }

    let contactNumber = change.business_phone;
    if (change.staff_id && change.staff_phone) {
      contactNumber = change.staff_phone;
    }

    let responseMessage = "";

    if (action === "approve") {
      if (change.request_type === "reschedule") {
        // ==================== اصلاح مهم برای reschedule ====================
        // دریافت new_date از دیتابیس - این تاریخ به فرمت YYYY-MM-DD است
        let finalNewDate = change.new_date;
        const newTime = change.new_time;
        
        console.log("Reschedule - new_date from DB:", finalNewDate);
        console.log("Reschedule - new_time from DB:", newTime);
        
        // اگر تاریخ به صورت Date object بود، تبدیل کن
        if (finalNewDate instanceof Date) {
          const year = finalNewDate.getFullYear();
          const month = String(finalNewDate.getMonth() + 1).padStart(2, '0');
          const day = String(finalNewDate.getDate()).padStart(2, '0');
          finalNewDate = `${year}-${month}-${day}`;
        }
        
        // اگر تاریخ شامل T بود (ISO format)، پاک کن
        if (typeof finalNewDate === "string" && finalNewDate.includes("T")) {
          finalNewDate = finalNewDate.split("T")[0];
        }
        
        console.log("Reschedule - final date to save:", finalNewDate);
        
        // بروزرسانی نوبت با تاریخ و زمان جدید
        await query(
          `UPDATE booking 
           SET booking_date = ?, booking_time = ?, change_count = change_count + 1, updated_at = NOW()
           WHERE id = ?`,
          [finalNewDate, newTime, change.booking_id],
        );
        
        // تایید درخواست در booking_changes
        await query(
          `UPDATE booking_changes 
           SET status = 'approved', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || null, id],
        );
        
        responseMessage = "درخواست تغییر زمان با موفقیت تایید شد";

        // ارسال پیامک به مشتری
        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "approved",
          salonName,
          contactNumber || "",
          finalNewDate,
          newTime,
          req,
        );
        
        // ثبت در smslog
        const persianDateDisplay = convertToPersianDateForDisplay(finalNewDate);
        await query(
          `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at)
           VALUES (?, ?, ?, 'reschedule_approved', 'sent', NOW())`,
          [
            change.user_id,
            change.client_phone,
            `نوبت شما در ${salonName} با موفقیت به تاریخ ${persianDateDisplay} ساعت ${formatTimeOnly(newTime)} تغییر یافت.`,
          ],
        );
        
      } else if (change.request_type === "cancel") {
        await query(
          `UPDATE booking 
           SET status = 'cancelled', customer_token = NULL, updated_at = NOW(), cancelled_by = 'admin', cancel_reason = ?
           WHERE id = ?`,
          [reason || "درخواست لغو توسط مشتری", change.booking_id],
        );

        if (isFromChanges) {
          await query(
            `UPDATE booking_changes 
             SET status = 'approved', admin_reason = ?, processed_at = NOW()
             WHERE id = ?`,
            [reason || null, id],
          );
        }

        responseMessage = "درخواست لغو نوبت با موفقیت تایید شد";
        
        // ارسال پیامک به مشتری
        const salonName = change.business_name?.trim() || "مجموعه";
        const persianDate = formatPersianDate(change.old_date);
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "approved",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );
        
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'active', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );
        
        const bookingDetails: any[] = await query(
          `SELECT booking_date, booking_time 
           FROM booking 
           WHERE id = ?`,
          [change.booking_id],
        );
        
        const bookingDate = bookingDetails[0]?.booking_date;
        const bookingTime = bookingDetails[0]?.booking_time;
        
        const salonName = change.business_name?.trim() || "مجموعه";
        await sendNewBookingApprovalSMS(
          change.client_phone,
          change.client_name,
          salonName,
          bookingDate,
          bookingTime,
          req,
        );
        
        responseMessage = "نوبت جدید با موفقیت تایید شد";
      }
      
    } else if (action === "reject") {
      if (change.request_type === "reschedule") {
        await query(
          `UPDATE booking_changes 
           SET status = 'rejected', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || "بدون دلیل", id],
        );
        responseMessage = "درخواست تغییر زمان رد شد";

        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "rejected",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );
        
      } else if (change.request_type === "cancel") {
        if (isFromChanges) {
          await query(
            `UPDATE booking_changes 
             SET status = 'rejected', admin_reason = ?, processed_at = NOW()
             WHERE id = ?`,
            [reason || "بدون دلیل", id],
          );
        }
        responseMessage = "درخواست لغو نوبت رد شد";
        
        // ارسال پیامک رد به مشتری
        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "rejected",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );
        
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'rejected', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );
        responseMessage = "درخواست نوبت جدید رد شد";
        
        // ارسال پیامک رد به مشتری
        const salonName = change.business_name?.trim() || "مجموعه";
        await sendChangeNotification(
          change.client_phone,
          change.client_name,
          "rejected",
          salonName,
          contactNumber || "",
          null,
          null,
          req,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
    
  } catch (error) {
    console.error("Error processing booking change:", error);
    return NextResponse.json(
      { success: false, message: "خطا در پردازش درخواست" },
      { status: 500 },
    );
  }
});