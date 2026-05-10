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
        b.staff_id as booking_staff_id
      FROM smslog sl
      LEFT JOIN booking b ON sl.booking_id = b.id
      WHERE sl.user_id = ? AND sl.status = ?
    `;
    const params: any[] = [userId, status];

    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );
      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        sql += " AND b.staff_id = ?";
        params.push(parseInt(staffId));
      } else {
        sql += " AND (b.staff_id IS NULL OR b.staff_id = ?)";
        params.push(parseInt(staffId));
      }
    } else {
      sql += ` AND b.staff_id IS NULL`;
    }

    const countSql = sql.replace(/SELECT.*?FROM/, "SELECT COUNT(*) as total FROM");
    const countResult = await query<any>(countSql, params);
    const total = countResult[0]?.total || 0;

    sql += ` ORDER BY sl.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const scheduledSms = await query<any>(sql, params);

    const formattedSms = scheduledSms.map((sms: any) => ({
      ...sms,
      scheduled_at_persian: sms.scheduled_at 
        ? new Date(sms.scheduled_at).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      created_at_persian: new Date(sms.created_at).toLocaleDateString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

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
  } catch (error: any) {
    // لاگ دقیق خطا
    console.error("Error fetching scheduled SMS:", error);
    console.error("SQL Error:", error.sqlMessage);
    console.error("SQL State:", error.sqlState);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "خطا در دریافت پیامک‌های زمان‌بندی شده",
        debug: error.sqlMessage || error.message
      },
      { status: 500 }
    );
  }
});