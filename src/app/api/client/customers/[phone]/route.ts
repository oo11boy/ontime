// File Path: src\app\api\Customers\[phone]\route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { getSmsBalanceDetails, sendSingleSms } from "@/lib/sms-utils";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId, params } = context;
  const phoneParams = await params;
  const { phone } = phoneParams;

  // GET: دریافت اطلاعات مشتری
  if (req.method === "GET") {
    try {
      // 1. دریافت اطلاعات اصلی مشتری
      const [client]: any = await query(
        `SELECT 
          c.id,
          c.client_name as name,
          c.client_phone as phone,
          c.is_blocked,
          c.total_bookings,
          c.cancelled_count,
          DATE_FORMAT(c.created_at, '%Y/%m/%d') as joinDate,
          u.name as businessName,
          j.persian_name as category
        FROM clients c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN jobs j ON u.job_id = j.id
        WHERE c.user_id = ? AND c.client_phone = ?`,
        [userId, phone]
      );

      if (!client) {
        return NextResponse.json(
          {
            success: false,
            message: "مشتری یافت نشد",
          },
          { status: 404 }
        );
      }

      // 2. دریافت نوبت‌های مشتری
      const appointments = await query(
        `SELECT 
          b.id,
          DATE_FORMAT(b.booking_date, '%Y/%m/%d') as date,
          DATE_FORMAT(b.booking_date, '%W، %d %M') as formattedDate,
          TIME_FORMAT(b.booking_time, '%H:%i') as time,
          b.booking_description as note,
          b.services,
          b.status,
          CASE 
            WHEN b.status = 'cancelled' THEN 'canceled'
            WHEN b.status = 'done' THEN 'completed'
            WHEN b.booking_date < CURDATE() THEN 'completed'
            WHEN b.booking_date = CURDATE() AND b.booking_time < CURTIME() THEN 'completed'
            ELSE 'pending'
          END as displayStatus
        FROM booking b
        WHERE b.user_id = ? AND b.client_phone = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC
        LIMIT 10`,
        [userId, phone]
      );

      // 3. آمار نوبت‌ها
      const [stats]: any = await query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
        FROM booking 
        WHERE user_id = ? AND client_phone = ?`,
        [userId, phone]
      );

      return NextResponse.json({
        success: true,
        client: {
          ...client,
          totalAppointments: stats.total,
          canceledAppointments: stats.cancelled,
          completedAppointments: stats.completed,
          activeAppointments: stats.active,
        },
        appointments,
      });
    } catch (error) {
      console.error("❌ خطا در دریافت اطلاعات مشتری:", error);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در دریافت اطلاعات مشتری",
        },
        { status: 500 }
      );
    }
  }

  // POST: ارسال پیامک به مشتری (حالا با سیستم متمرکز)
  if (req.method === "POST") {
    try {
      const { message } = await req.json();

      if (!message?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "متن پیامک الزامی است",
          },
          { status: 400 }
        );
      }

      // بررسی موجودی پیامک
      const balanceDetails = await getSmsBalanceDetails(userId as number);
      
      if (balanceDetails.total_balance < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "موجودی پیامک کافی نیست",
            balanceDetails
          },
          { status: 402 }
        );
      }

      // ارسال پیامک با تابع متمرکز (که خودش موجودی را چک و کسر می‌کند)
      const smsResult = await sendSingleSms({

        to_phone: phone as string, // Type assertion برای رفع خطا TS (phone می‌تواند string | string[] باشد، اما در params تک رشته است)
        content: message.trim(),
        sms_type: 'individual',
      });

      if (!smsResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: smsResult.message || "خطا در ارسال پیامک",
          },
          { status: 500 }
        );
      }

      // دریافت موجودی جدید پس از ارسال
      const newBalanceDetails = await getSmsBalanceDetails(userId as number);

      return NextResponse.json({
        success: true,
        message: "پیامک با موفقیت ارسال شد",
        smsDeducted: true,
        newBalance: newBalanceDetails.total_balance,
        balanceDetails: newBalanceDetails
      });
    } catch (error) {
      console.error("❌ خطا در ارسال پیامک:", error);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در ارسال پیامک",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "متد مجاز نیست" },
    { status: 405 }
  );
});

export { handler as GET, handler as POST };