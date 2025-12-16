import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

/* =======================
   Interfaces
======================= */
interface TopBusiness {
  id: number;
  name: string;
  phone: string;
  job_title: string;
  plan_title: string;
  sms_balance: number;
  bookings_count: number;
  customer_count: number;
  cancellation_rate: number;
  recent_booking_date: string;
  growth: string;
  isPositiveGrowth: boolean;
}

interface BusinessDetails {
  id: number;
  name: string;
  phone: string;
  job_title: string;
  plan_title: string;
  registration_date: string;
  total_bookings: number;
  total_customers: number;
  cancellation_rate: number;
  sms_balance: number;
  purchased_sms_credit: number;
  recent_bookings: any[];
  popular_services: any[];
}

/* =======================
   Route
======================= */
export const GET = withAdminAuth(
  async (request: Request) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = Number(searchParams.get("limit") || 10);
      const businessId = searchParams.get("id");

      if (businessId) {
        return getBusinessDetails(Number(businessId));
      }

      return getTopBusinesses(limit);
    } catch (error) {
      console.error("GET error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت اطلاعات" },
        { status: 500 }
      );
    }
  },
  ["super_admin", "editor", "viewer"]
);

/* =======================
   FAST Top Businesses
======================= */
async function getTopBusinesses(limit: number) {
  try {
    limit = Number(limit) || 10;

    /* ========= 1. Main Fast Query ========= */
    const businesses = await query<any>(`
      SELECT
        u.id,
        u.name,
        u.phone,
        COALESCE(j.persian_name, 'نامشخص') AS job_title,
        COALESCE(p.title, 'بدون پلن') AS plan_title,
        COALESCE(u.sms_balance, 0) AS sms_balance,

        COUNT(b.id) AS bookings_count,
        COUNT(DISTINCT c.id) AS customer_count,

        IF(
          COUNT(b.id) = 0,
          0,
          ROUND(
            SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END)
            / COUNT(b.id) * 100
          )
        ) AS cancellation_rate,

        MAX(b.booking_date) AS recent_booking_date

      FROM users u
      INNER JOIN booking b ON b.user_id = u.id AND b.id > 0
      LEFT JOIN clients c ON c.user_id = u.id
      LEFT JOIN jobs j ON j.id = u.job_id
      LEFT JOIN plans p ON p.plan_key = u.plan_key

      WHERE u.name IS NOT NULL AND u.name != ''
      GROUP BY u.id
      ORDER BY bookings_count DESC
      LIMIT ${limit}
    `);

    if (!businesses.length) {
      return NextResponse.json({
        success: true,
        businesses: [],
        total: 0,
      });
    }

    /* ========= 2. Growth (2 light queries) ========= */
    const ids = businesses.map((b: any) => b.id);
    const placeholders = ids.map(() => "?").join(",");

    const last30 = await query<any>(
      `
      SELECT user_id, COUNT(*) AS count
      FROM booking
      WHERE user_id IN (${placeholders})
        AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY user_id
      `,
      ids
    );

    const prev30 = await query<any>(
      `
      SELECT user_id, COUNT(*) AS count
      FROM booking
      WHERE user_id IN (${placeholders})
        AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        AND booking_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY user_id
      `,
      ids
    );

    const lastMap = Object.fromEntries(
      last30.map((r: any) => [r.user_id, r.count])
    );
    const prevMap = Object.fromEntries(
      prev30.map((r: any) => [r.user_id, r.count])
    );

    const finalData: TopBusiness[] = businesses.map((b: any) => {
      const current = lastMap[b.id] || 0;
      const previous = prevMap[b.id] || 0;

      let growth = "0%";
      let isPositiveGrowth = true;

      if (previous > 0) {
        const g = Math.round(((current - previous) / previous) * 100);
        growth = `${g >= 0 ? "+" : ""}${g}%`;
        isPositiveGrowth = g >= 0;
      } else if (current > 0) {
        growth = "+100%";
      }

      return {
        ...b,
        recent_booking_date: b.recent_booking_date || "بدون نوبت",
        growth,
        isPositiveGrowth,
      };
    });

    return NextResponse.json({
      success: true,
      businesses: finalData,
      total: finalData.length,
    });
  } catch (error) {
    console.error("FAST getTopBusinesses error:", error);
    return NextResponse.json(
      { success: false, message: "خطای دیتابیس" },
      { status: 500 }
    );
  }
}

/* =======================
   Business Details
======================= */
async function getBusinessDetails(businessId: number) {
  try {
    const info = await query<any>(
      `
      SELECT
        u.id,
        u.name,
        u.phone,
        u.created_at AS registration_date,
        COALESCE(j.persian_name, 'نامشخص') AS job_title,
        COALESCE(p.title, 'بدون پلن') AS plan_title,
        COALESCE(u.sms_balance, 0) AS sms_balance,
        COALESCE(u.purchased_sms_credit, 0) AS purchased_sms_credit
      FROM users u
      LEFT JOIN jobs j ON j.id = u.job_id
      LEFT JOIN plans p ON p.plan_key = u.plan_key
      WHERE u.id = ?
      `,
      [businessId]
    );

    if (!info.length) {
      return NextResponse.json(
        { success: false, message: "کسب‌وکار یافت نشد" },
        { status: 404 }
      );
    }

    const stats = await query<any>(
      `
      SELECT
        COUNT(*) AS total_bookings,
        COUNT(DISTINCT c.id) AS total_customers,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM booking b
      LEFT JOIN clients c
        ON b.client_phone = c.client_phone AND b.user_id = c.user_id
      WHERE b.user_id = ? AND b.id > 0
      `,
      [businessId]
    );

    const totalBookings = stats[0]?.total_bookings || 0;
    const cancelled = stats[0]?.cancelled || 0;

    const cancellationRate =
      totalBookings > 0
        ? Math.round((cancelled / totalBookings) * 100)
        : 0;

    const recentBookings = await query<any>(
      `
      SELECT
        id,
        client_name,
        booking_date,
        booking_time,
        status,
        COALESCE(services, '') AS services
      FROM booking
      WHERE user_id = ? AND id > 0
      ORDER BY booking_date DESC, booking_time DESC
      LIMIT 5
      `,
      [businessId]
    );

    const details: BusinessDetails = {
      ...info[0],
      total_bookings: totalBookings,
      total_customers: stats[0]?.total_customers || 0,
      cancellation_rate: cancellationRate,
      recent_bookings: recentBookings,
      popular_services: [],
    };

    return NextResponse.json({
      success: true,
      business: details,
    });
  } catch (error) {
    console.error("getBusinessDetails error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جزئیات" },
      { status: 500 }
    );
  }
}
