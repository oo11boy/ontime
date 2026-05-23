import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";

  try {
    let sql = `
      SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        COALESCE(b.service_name, us.name) as service_name,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as booking_time,
        b.duration_minutes,
        b.notes,
        b.status,
        b.source,
        b.approved_from_link,
        b.created_at,
        DATE_FORMAT(b.token_expires_at, '%Y-%m-%d %H:%i:%s') as token_expires_at
      FROM booking b
      LEFT JOIN user_services us ON b.service_id = us.id
      WHERE b.user_id = ? 
        AND b.status = 'active'
        AND b.approved_from_link = 1
        AND b.source = 'internal'
    `;
    
    const params: any[] = [userId];

    if (filter === "upcoming") {
      sql += " AND (b.booking_date > CURDATE() OR (b.booking_date = CURDATE() AND b.booking_time > CURTIME()))";
    } else if (filter === "past") {
      sql += " AND (b.booking_date < CURDATE() OR (b.booking_date = CURDATE() AND b.booking_time < CURTIME()))";
    }

    sql += " ORDER BY b.booking_date ASC, b.booking_time ASC";

    const bookings = await query(sql, params);

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
    });
  } catch (error) {
    console.error("Error fetching approved from link bookings:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت نوبت‌های تایید شده" },
      { status: 500 }
    );
  }
});