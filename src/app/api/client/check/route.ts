import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { message: "Phone number is required" },
      { status: 400 }
    );
  }

  try {
    // 1. چک کردن در جدول clients (اگر وجود دارد)
    let clientFromClientsTable = null;
    try {
      const [clientResult]: any = await query(
        "SELECT id, client_name, total_bookings, last_booking_date, is_blocked FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, phone]
      );
      clientFromClientsTable = clientResult;
    } catch (error) {
      console.log("clients table may not exist, skipping...");
    }

    // 2. چک کردن در جدول booking (برای مشتریانی که هنوز در clients نیستند)
    const [bookingResult]: any = await query(
      `SELECT 
         client_name,
         COUNT(*) as total_bookings,
         MAX(booking_date) as last_booking_date,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
       FROM booking 
       WHERE user_id = ? AND client_phone = ?
       GROUP BY client_name
       ORDER BY MAX(created_at) DESC
       LIMIT 1`,
      [userId, phone]
    );

    if (!clientFromClientsTable && !bookingResult) {
      return NextResponse.json({
        exists: false,
        message: "مشتری جدید"
      });
    }

    // اگر در clients وجود داشت، آن را برگردان
    if (clientFromClientsTable) {
      return NextResponse.json({
        exists: true,
        client: {
          id: clientFromClientsTable.id,
          name: clientFromClientsTable.client_name,
          totalBookings: clientFromClientsTable.total_bookings,
          lastBookingDate: clientFromClientsTable.last_booking_date,
          isBlocked: clientFromClientsTable.is_blocked,
          source: "clients_table"
        },
        message: "مشتری موجود در سیستم"
      });
    }

    // اگر فقط در booking وجود داشت
    if (bookingResult) {
      return NextResponse.json({
        exists: true,
        client: {
          name: bookingResult.client_name,
          totalBookings: bookingResult.total_bookings,
          lastBookingDate: bookingResult.last_booking_date,
          cancelledCount: bookingResult.cancelled_count,
          source: "booking_history"
        },
        message: "مشتری موجود در تاریخچه نوبت‌ها"
      });
    }

    return NextResponse.json({
      exists: false,
      message: "مشتری جدید"
    });

  } catch (error) {
    console.error("Error checking client:", error);
    return NextResponse.json(
      { message: "خطا در بررسی مشتری", error: String(error) },
      { status: 500 }
    );
  }
});