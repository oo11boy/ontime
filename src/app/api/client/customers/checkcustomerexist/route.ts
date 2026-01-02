import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const url = new URL(req.url);
  const rawPhone = url.searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json(
      { message: "شماره موبایل الزامی است" },
      { status: 400 }
    );
  }

  // چک کردن هر دو حالت (با صفر و بدون صفر)
  const phoneWithZero = rawPhone.startsWith("0") ? rawPhone : "0" + rawPhone;
  const phoneWithoutZero = rawPhone.startsWith("0")
    ? rawPhone.substring(1)
    : rawPhone;

  try {
    // ۱. جستجو در جدول clients
    const clientResult: any = await query(
      "SELECT id, client_name, total_bookings, last_booking_date, is_blocked FROM clients WHERE user_id = ? AND (client_phone = ? OR client_phone = ?) LIMIT 1",
      [userId, phoneWithZero, phoneWithoutZero]
    );
    const clientFromClientsTable = Array.isArray(clientResult)
      ? clientResult[0]
      : clientResult;

    // ۲. جستجو در جدول booking
    const bookingResultRaw: any = await query(
      `SELECT 
          client_name,
          COUNT(*) as total_bookings,
          MAX(booking_date) as last_booking_date,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
        FROM booking 
        WHERE user_id = ? AND (client_phone = ? OR client_phone = ?)
        GROUP BY client_name
        ORDER BY MAX(created_at) DESC
        LIMIT 1`,
      [userId, phoneWithZero, phoneWithoutZero]
    );
    const bookingResult = Array.isArray(bookingResultRaw)
      ? bookingResultRaw[0]
      : bookingResultRaw;

    if (!clientFromClientsTable && !bookingResult) {
      return NextResponse.json({ exists: false, message: "مشتری جدید" });
    }

    if (clientFromClientsTable) {
      return NextResponse.json({
        exists: true,
        client: {
          id: clientFromClientsTable.id,
          name: clientFromClientsTable.client_name,
          totalBookings: clientFromClientsTable.total_bookings,
          lastBookingDate: clientFromClientsTable.last_booking_date,
          isBlocked: clientFromClientsTable.is_blocked,
          source: "clients_table",
        },
        message: "مشتری در سیستم یافت شد",
      });
    }

    if (bookingResult) {
      return NextResponse.json({
        exists: true,
        client: {
          name: bookingResult.client_name,
          totalBookings: bookingResult.total_bookings,
          lastBookingDate: bookingResult.last_booking_date,
          cancelledCount: bookingResult.cancelled_count,
          source: "booking_history",
        },
        message: "مشتری در تاریخچه یافت شد",
      });
    }

    return NextResponse.json({ exists: false, message: "مشتری جدید" });
  } catch (error) {
    console.error("Error checking client:", error);
    return NextResponse.json(
      { message: "خطای سرور", error: String(error) },
      { status: 500 }
    );
  }
});
