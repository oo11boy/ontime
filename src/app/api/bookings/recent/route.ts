// src/app/api/appointments/recent/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const appointments = await query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_phone,
        DATE_FORMAT(b.booking_date, '%Y/%m/%d') as booking_date,
        TIME_FORMAT(b.booking_time, '%H:%i') as booking_time,
        b.booking_description,
        b.services,
        b.status
      FROM booking b
      WHERE b.user_id = ? 
        AND b.status = 'active'
        AND (
          b.booking_date > CURDATE() 
          OR (b.booking_date = CURDATE() AND b.booking_time > CURTIME())
        )
      ORDER BY b.booking_date ASC, b.booking_time ASC
      LIMIT 10`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      appointments: appointments || []
    });
  } catch (error) {
    console.error("Error fetching recent appointments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت نوبت‌های اخیر",
        appointments: []
      },
      { status: 500 }
    );
  }
});