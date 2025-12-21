import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { getSmsBalanceDetails } from "@/lib/sms-server";
import { sendSingleSms } from "@/lib/sms-client";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId, params } = context;
  const phoneParams = await params;
  const { phone } = phoneParams;

  // GET: دریافت اطلاعات مشتری
  if (req.method === "GET") {
    try {
      // ۱. دریافت اطلاعات اصلی مشتری
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
          { success: false, message: "مشتری یافت نشد" },
          { status: 404 }
        );
      }

      // ۲. دریافت نوبت‌های مشتری با نمایش صحیح وضعیت
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
            -- اگر وضعیت active است اما زمانش گذشته، در ظاهر به عنوان تکمیل شده نشان بده
            WHEN b.status = 'active' AND (b.booking_date < CURDATE() OR (b.booking_date = CURDATE() AND b.booking_time < CURTIME())) THEN 'completed'
            ELSE 'pending'
          END as displayStatus
        FROM booking b
        WHERE b.user_id = ? AND b.client_phone = ?
        ORDER BY b.booking_date DESC, b.booking_time DESC
        LIMIT 10`,
        [userId, phone]
      );

      // ۳. آمار نوبت‌ها
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
          totalAppointments: stats.total || 0,
          canceledAppointments: stats.cancelled || 0,
          completedAppointments: stats.completed || 0,
          activeAppointments: stats.active || 0,
        },
        appointments,
      });
    } catch (error) {
      console.error("❌ خطا در دریافت اطلاعات مشتری:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت اطلاعات مشتری" },
        { status: 500 }
      );
    }
  }

  // POST: ارسال پیامک تکی
  if (req.method === "POST") {
    try {
      const { message } = await req.json();

      if (!message?.trim()) {
        return NextResponse.json(
          { success: false, message: "متن پیامک الزامی است" },
          { status: 400 }
        );
      }

      // بررسی موجودی (قبل از هر اقدامی)
      const balanceDetails = await getSmsBalanceDetails(userId as number);
      if (balanceDetails.total_balance < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "موجودی پیامک کافی نیست",
            balanceDetails,
          },
          { status: 402 }
        );
      }

      // ارسال پیامک با استفاده از تابع متمرکز
      // نکته: این تابع در خروجی باید موفقیت ارسال به درگاه را برگرداند
      const smsResult = await sendSingleSms({
        to_phone: phone as string,
        content: message.trim(),
        sms_type: "individual",
        // اگر این پیامک مربوط به نوبت خاصی نیست، نیازی به booking_id نداریم
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

      // دریافت موجودی نهایی
      const newBalance = await getSmsBalanceDetails(userId as number);

      return NextResponse.json({
        success: true,
        message: "پیامک در صف ارسال قرار گرفت",
        newBalance: newBalance.total_balance,
      });
    } catch (error) {
      console.error("❌ خطا در ارسال پیامک:", error);
      return NextResponse.json(
        { success: false, message: "خطا در پردازش ارسال" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST };
