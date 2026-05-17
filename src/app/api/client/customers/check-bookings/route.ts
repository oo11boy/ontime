// src/app/api/client/customers/check-bookings/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
interface Client {
  client_phone: string;
}

interface BookingCount {
  count: number;
}
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { success: false, message: "شناسه مشتری الزامی است" },
      { status: 400 },
    );
  }

  try {
    // دریافت شماره تلفن مشتری
    const [client] = await query<Client>(
      `SELECT client_phone FROM clients WHERE id = ? AND user_id = ?`,
      [clientId, userId],
    );

    if (!client) {
      return NextResponse.json(
        { success: false, message: "مشتری یافت نشد" },
        { status: 404 },
      );
    }

    // بررسی نوبت‌های فعال
    const activeBookings = await query<BookingCount>(
      `SELECT COUNT(*) as count FROM booking 
       WHERE user_id = ? AND client_phone = ? AND status = 'active'`,
      [userId, client.client_phone],
    );

    const activeBookingsCount = activeBookings?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      hasActiveBookings: activeBookingsCount > 0,
      activeBookingsCount,
    });
  } catch (error) {
    console.error("Check bookings error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بررسی نوبت‌ها" },
      { status: 500 },
    );
  }
});