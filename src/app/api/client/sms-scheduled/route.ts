// src/app/api/client/sms-scheduled/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export const GET = withAuth(async (req: Request, context: any) => {
  const { userId } = context;

  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let sql = `
      SELECT 
        sl.id,
        sl.to_phone,
        sl.cost,
        sl.sms_type,
        sl.scheduled_at,
        sl.status,
        sl.error_message,
        sl.created_at,
        sl.booking_date,
        sl.booking_time,
        sl.reminder_hours_before,
        b.client_name,
        b.services,
        b.id as booking_id,
        b.staff_id as booking_staff_id,
        s.name as staff_name
      FROM smslog sl
      LEFT JOIN booking b ON sl.booking_id = b.id
      LEFT JOIN staffs s ON b.staff_id = s.id
      WHERE sl.user_id = ? AND sl.status = ?
    `;
    const params: any[] = [userId, status];

    // منطق دسترسی بر اساس نوع کاربر
    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId],
      );
      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        // پرسنل مستقل: فقط پیامک‌های خودش
        sql += " AND b.staff_id = ?";
        params.push(parseInt(staffId));
      } else {
        // پرسنل هماهنگ: فقط پیامک‌های خودش
        sql += " AND b.staff_id = ?";
        params.push(parseInt(staffId));
      }
    } else {
      // رییس: همه پیامک‌های نوبت‌های خودش (staff_id IS NULL) + پیامک‌های پرسنل هماهنگ (synced)
      sql += ` AND (
        b.staff_id IS NULL 
        OR b.staff_id IN (
          SELECT id FROM staffs 
          WHERE owner_user_id = ? AND calendar_type = 'synced' AND is_active = 1
        )
      )`;
      params.push(userId);
    }

    // دریافت تعداد کل برای pagination
    const countSql = sql.replace(
      /SELECT.*?FROM/,
      "SELECT COUNT(*) as total FROM",
    );
    const countResult = await query<any>(countSql, params);
    const total = countResult[0]?.total || 0;

    // اضافه کردن مرتب‌سازی و pagination
    sql += ` ORDER BY sl.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const scheduledSms = await query<any>(sql, params);

    // فرمت کردن تاریخ‌ها
    const formattedSms = scheduledSms.map((sms: any) => {
      let scheduledAtPersian = "بلافاصله";
      if (sms.scheduled_at) {
        const date = new Date(sms.scheduled_at);
        scheduledAtPersian = new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      }

      return {
        ...sms,
        scheduled_at_persian: scheduledAtPersian,
        created_at_persian: new Date(sms.created_at).toLocaleDateString(
          "fa-IR",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        ),
      };
    });

    return NextResponse.json({
      success: true,
      scheduledSms: formattedSms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching scheduled SMS:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت پیامک‌های زمان‌بندی شده" },
      { status: 500 },
    );
  }
});
