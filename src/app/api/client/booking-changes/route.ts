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

// تابع نرمالایز کردن تاریخ
const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return "";
  
  let normalized = dateStr;
  
  if (normalized.includes("T")) {
    normalized = normalized.split("T")[0];
  }
  
  if (normalized.includes("Z")) {
    normalized = normalized.replace("Z", "");
  }
  
  if (normalized.includes(" ")) {
    normalized = normalized.split(" ")[0];
  }
  
  return normalized;
};

// تبدیل تاریخ میلادی به شمسی برای پیامک (فرمت: YYYY/MM/DD)
const convertToPersianDateForSMS = (dateStr: string): string => {
  if (!dateStr) return "";
  
  try {
    const normalizedDate = normalizeDate(dateStr);
    
    if (normalizedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = normalizedDate.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const jDate = moment(date);
      
      if (!jDate.isValid()) return normalizedDate;
      
      const jYear = jDate.jYear();
      const jMonth = jDate.jMonth() + 1;
      const jDay = jDate.jDate();
      
      return `${jYear}/${jMonth.toString().padStart(2, "0")}/${jDay.toString().padStart(2, "0")}`;
    }
    return normalizedDate;
  } catch (error) {
    return dateStr;
  }
};

// الگوهای پیامک
const PATTERNS = {
  APPROVED: "q40uuerggl4qodq",
  REJECTED: "eowphltmynwerv6",
  NEW_BOOKING_APPROVED: "dtqxphdv9epu14v",
  NEW_BOOKING_REJECTED: "ajx0w6hmcqpw948",
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
  userId: number,
  req: NextRequest,
  requestType?: string,
) {
  let patternCode = status === "approved" ? PATTERNS.APPROVED : PATTERNS.REJECTED;
  
  if (status === "rejected" && requestType === "new_booking") {
    patternCode = PATTERNS.NEW_BOOKING_REJECTED;
  }

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

    await query(
      `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at, message_count)
       VALUES (?, ?, ?, 'booking_change_notification', 'sent', NOW(), ?)`,
      [
        userId,
        customerPhone,
        status === "approved"
          ? `نوبت شما در ${salonName} با موفقیت ${newDate && newTime ? `به تاریخ ${params.date} ساعت ${params.time} تغییر یافت` : "لغو شد"}.`
          : `درخواست شما توسط ${salonName} رد شد. برای اطلاعات بیشتر با ${contactPhone} تماس بگیرید.`,
        messageCount,
      ],
    );

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
  userId: number,
  req: NextRequest,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    "https://ontimeapp.ir";

  const normalizedDate = normalizeDate(bookingDate);
  const persianDate = convertToPersianDateForSMS(normalizedDate);
  const formattedTime = formatTimeOnly(bookingTime);
  const messageCount = 2;

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
        message_count: messageCount,
        name: customerName || "کاربر گرامی",
        salon: salonName,
        date: persianDate,
        time: formattedTime,
      }),
    });

    const result = await response.json();

    await query(
      `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at, message_count)
       VALUES (?, ?, ?, 'new_booking_approved', 'sent', NOW(), ?)`,
      [
        userId,
        customerPhone,
        `نوبت شما در ${salonName} برای تاریخ ${persianDate} ساعت ${formattedTime} با موفقیت ثبت شد.`,
        messageCount,
      ],
    );

    return result.success;
  } catch (error) {
    console.error("Error sending new booking approval SMS:", error);
    return false;
  }
}

// تابع ارسال پیامک رد نوبت جدید
async function sendNewBookingRejectionSMS(
  customerPhone: string,
  customerName: string,
  salonName: string,
  contactPhone: string,
  userId: number,
  req: NextRequest,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get("origin") ||
    "https://ontimeapp.ir";

  const messageCount = 2;

  try {
    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        to_phone: customerPhone,
        sms_type: "new_booking_rejected",
        template_key: PATTERNS.NEW_BOOKING_REJECTED,
        message_count: messageCount,
        name: customerName || "کاربر گرامی",
        salon: salonName,
        phone: contactPhone,
      }),
    });

    const result = await response.json();

    await query(
      `INSERT INTO smslog (user_id, to_phone, content, sms_type, status, created_at, message_count)
       VALUES (?, ?, ?, 'new_booking_rejected', 'sent', NOW(), ?)`,
      [
        userId,
        customerPhone,
        `درخواست نوبت شما در ${salonName} متاسفانه رد شد. برای اطلاعات بیشتر با ${contactPhone} تماس بگیرید.`,
        messageCount,
      ],
    );

    return result.success;
  } catch (error) {
    console.error("Error sending new booking rejection SMS:", error);
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
        b.status as current_status,
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
      current_status: booking.status,
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
        b.status as current_status,
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

    // ========== 4. اضافه کردن نوبت‌های فعال ==========
    let activeBookingsSql = `
      SELECT 
        b.id as booking_id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as old_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as old_time,
        NULL as new_date,
        NULL as new_time,
        NULL as reason,
        NULL as admin_reason,
        'approved' as status,
        b.created_at as requested_at,
        NULL as processed_at,
        b.staff_id,
        NULL as cancelled_by,
        NULL as cancel_reason,
        b.service_name,
        b.services,
        b.status as current_status,
        s.name as staff_name,
        u.business_name,
        u.phone as business_phone,
        s.calendar_type,
        s.phone as staff_phone,
        'active_booking' as request_type
      FROM booking b
      LEFT JOIN staffs s ON b.staff_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'active'
        AND b.booking_date >= CURDATE()
    `;

    const activeBookingsParams: any[] = [];

    if (userType === "staff" && staffId) {
      activeBookingsSql += " AND b.staff_id = ?";
      activeBookingsParams.push(parseInt(staffId));
    } else {
      activeBookingsSql += ` AND b.user_id = ?`;
      activeBookingsParams.push(userId);
    }

    const activeBookings = await query(activeBookingsSql, activeBookingsParams);
    allRequests.push(...activeBookings);

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
    const { id, action, reason, booking_id, force } = body;

    // ==================== لغو مستقیم نوبت توسط مدیر ====================
    if (action === "direct_cancel" && booking_id) {
      const bookingData: any[] = await query(
        `SELECT b.*, u.business_name, u.phone as business_phone, s.name as staff_name
         FROM booking b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN staffs s ON b.staff_id = s.id
         WHERE b.id = ? AND b.user_id = ? AND b.status = 'active'`,
        [booking_id, userId],
      );

      if (bookingData.length === 0) {
        return NextResponse.json(
          { success: false, message: "نوبت یافت نشد یا قابل لغو نیست" },
          { status: 404 },
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
        [reason || "لغو توسط مدیر", booking_id],
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
        ],
      );

      await query(
        `INSERT INTO notifications (user_id, booking_id, type, message, created_at)
         VALUES (?, ?, 'cancel', ?, NOW())`,
        [
          userId,
          booking.id,
          `نوبت ${booking.client_name} در تاریخ ${persianDate} ساعت ${timeDisplay} توسط مدیر لغو شد.`,
        ],
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
        let finalNewDate = change.new_date;
        const newTime = change.new_time;

        if (finalNewDate instanceof Date) {
          const year = finalNewDate.getFullYear();
          const month = String(finalNewDate.getMonth() + 1).padStart(2, "0");
          const day = String(finalNewDate.getDate()).padStart(2, "0");
          finalNewDate = `${year}-${month}-${day}`;
        }

        if (typeof finalNewDate === "string" && finalNewDate.includes("T")) {
          finalNewDate = finalNewDate.split("T")[0];
        }

        await query(
          `UPDATE booking 
           SET booking_date = ?, booking_time = ?, change_count = change_count + 1, updated_at = NOW()
           WHERE id = ?`,
          [finalNewDate, newTime, change.booking_id],
        );

        await query(
          `UPDATE booking_changes 
           SET status = 'approved', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || null, id],
        );

        responseMessage = force 
          ? "درخواست تغییر زمان با موفقیت تایید شد (پیامکی ارسال نشد)"
          : "درخواست تغییر زمان با موفقیت تایید شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendChangeNotification(
            change.client_phone,
            change.client_name,
            "approved",
            salonName,
            contactNumber || "",
            finalNewDate,
            newTime,
            change.user_id,
            req,
            change.request_type,
          );
        }
        
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

        responseMessage = force
          ? "درخواست لغو نوبت با موفقیت تایید شد (پیامکی ارسال نشد)"
          : "درخواست لغو نوبت با موفقیت تایید شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendChangeNotification(
            change.client_phone,
            change.client_name,
            "approved",
            salonName,
            contactNumber || "",
            null,
            null,
            change.user_id,
            req,
            change.request_type,
          );
        }
        
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'active', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );

        const bookingDetails: any[] = await query(
          `SELECT DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, 
                  TIME_FORMAT(booking_time, '%H:%i') as booking_time
           FROM booking 
           WHERE id = ?`,
          [change.booking_id],
        );

        const bookingDate = bookingDetails[0]?.booking_date;
        const bookingTime = bookingDetails[0]?.booking_time;

        responseMessage = force
          ? "نوبت جدید با موفقیت تایید شد (پیامکی ارسال نشد)"
          : "نوبت جدید با موفقیت تایید شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendNewBookingApprovalSMS(
            change.client_phone,
            change.client_name,
            salonName,
            bookingDate,
            bookingTime,
            change.user_id,
            req,
          );
        }
      }
      
    } else if (action === "reject") {
      if (change.request_type === "reschedule") {
        await query(
          `UPDATE booking_changes 
           SET status = 'rejected', admin_reason = ?, processed_at = NOW()
           WHERE id = ?`,
          [reason || "بدون دلیل", id],
        );
        responseMessage = force
          ? "درخواست تغییر زمان رد شد (پیامکی ارسال نشد)"
          : "درخواست تغییر زمان رد شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendChangeNotification(
            change.client_phone,
            change.client_name,
            "rejected",
            salonName,
            contactNumber || "",
            null,
            null,
            change.user_id,
            req,
            change.request_type,
          );
        }
        
      } else if (change.request_type === "cancel") {
        if (isFromChanges) {
          await query(
            `UPDATE booking_changes 
             SET status = 'rejected', admin_reason = ?, processed_at = NOW()
             WHERE id = ?`,
            [reason || "بدون دلیل", id],
          );
        }
        responseMessage = force
          ? "درخواست لغو نوبت رد شد (پیامکی ارسال نشد)"
          : "درخواست لغو نوبت رد شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendChangeNotification(
            change.client_phone,
            change.client_name,
            "rejected",
            salonName,
            contactNumber || "",
            null,
            null,
            change.user_id,
            req,
            change.request_type,
          );
        }
        
      } else if (change.request_type === "new_booking") {
        await query(
          `UPDATE booking 
           SET status = 'rejected', updated_at = NOW()
           WHERE id = ?`,
          [change.booking_id],
        );
        responseMessage = force
          ? "درخواست نوبت جدید رد شد (پیامکی ارسال نشد)"
          : "درخواست نوبت جدید رد شد";

        if (!force) {
          const salonName = change.business_name?.trim() || "مجموعه";
          await sendNewBookingRejectionSMS(
            change.client_phone,
            change.client_name,
            salonName,
            contactNumber || "",
            change.user_id,
            req,
          );
        }
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