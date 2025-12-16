import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

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

export const GET = withAdminAuth(
  async (request: Request) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "10");
      const businessId = searchParams.get("id");

      if (businessId) {
        return getBusinessDetails(parseInt(businessId));
      }

      return getTopBusinesses(limit);
    } catch (error: any) {
      console.error("Error fetching top businesses:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت اطلاعات کسب‌وکارهای برتر" },
        { status: 500 }
      );
    }
  },
  ["super_admin", "editor", "viewer"]
);

async function getTopBusinesses(limit: number = 10) {
  try {
    // ابتدا کسب‌وکارهایی که واقعاً نوبت داشته‌اند را پیدا می‌کنیم
    const businessesWithBookings = await query<any>(`
      SELECT DISTINCT u.id
      FROM users u
      INNER JOIN booking b ON u.id = b.user_id
      WHERE u.id > 0 
        AND u.name IS NOT NULL 
        AND u.name != ''
        AND b.id > 0
    `);

    if (businessesWithBookings.length === 0) {
      return NextResponse.json({
        success: true,
        businesses: [],
        total: 0,
        message: "هیچ کسب‌وکاری با نوبت‌دهی یافت نشد",
      });
    }

    const userIds = businessesWithBookings.map((b) => b.id);
    const placeholders = userIds.map(() => "?").join(",");

    const topBusinesses = await query<TopBusiness>(
      `
      SELECT 
        u.id,
        COALESCE(u.name, 'بدون نام') as name,
        u.phone,
        COALESCE(j.persian_name, 'نامشخص') as job_title,
        COALESCE(p.title, 'بدون پلن') as plan_title,
        COALESCE(u.sms_balance, 0) as sms_balance,
        (
          SELECT COUNT(*) 
          FROM booking b 
          WHERE b.user_id = u.id 
            AND b.id > 0
        ) as bookings_count,
        (
          SELECT COUNT(DISTINCT id) 
          FROM clients c 
          WHERE c.user_id = u.id
        ) as customer_count,
        COALESCE(
          (
            SELECT 
              CASE 
                WHEN COUNT(*) > 0 THEN
                  (SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100)
                ELSE 0
              END
            FROM booking 
            WHERE user_id = u.id
          ), 
          0
        ) as cancellation_rate,
        COALESCE(
          (
            SELECT MAX(booking_date) 
            FROM booking 
            WHERE user_id = u.id
          ), 
          'بدون نوبت'
        ) as recent_booking_date
      FROM users u
      LEFT JOIN jobs j ON u.job_id = j.id
      LEFT JOIN plans p ON u.plan_key = p.plan_key
      WHERE u.id IN (${placeholders})
        AND u.id > 0
      ORDER BY bookings_count DESC
      LIMIT ?
    `,
      [...userIds, limit]
    );

    // محاسبه رشد
    const businessesWithGrowth = await Promise.all(
      topBusinesses.map(async (business) => {
        try {
          // نوبت‌های ۳۰ روز اخیر
          const last30Days = await query<{ count: number }>(
            `
            SELECT COUNT(*) as count 
            FROM booking 
            WHERE user_id = ? 
              AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              AND id > 0
          `,
            [business.id]
          );

          // نوبت‌های ۳۰ تا ۶۰ روز پیش
          const previous30Days = await query<{ count: number }>(
            `
            SELECT COUNT(*) as count 
            FROM booking 
            WHERE user_id = ? 
              AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
              AND booking_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              AND id > 0
          `,
            [business.id]
          );

          const current = last30Days[0]?.count || 0;
          const previous = previous30Days[0]?.count || 0;

          let growthPercent = "0%";
          let isPositiveGrowth = true;

          if (previous > 0) {
            const growth = ((current - previous) / previous) * 100;
            growthPercent = `${growth >= 0 ? "+" : ""}${Math.round(growth)}%`;
            isPositiveGrowth = growth >= 0;
          } else if (current > 0) {
            growthPercent = "+100%";
            isPositiveGrowth = true;
          }

          return {
            ...business,
            bookings_count: business.bookings_count || 0,
            growth: growthPercent,
            isPositiveGrowth,
          };
        } catch (error) {
          return {
            ...business,
            bookings_count: business.bookings_count || 0,
            growth: "0%",
            isPositiveGrowth: true,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      businesses: businessesWithGrowth,
      total: topBusinesses.length,
      message: "اطلاعات با موفقیت دریافت شد",
    });
  } catch (error) {
    console.error("Error in getTopBusinesses:", error);
    return NextResponse.json({
      success: false,
      businesses: [],
      total: 0,
      message: "خطا در پردازش اطلاعات",
    });
  }
}

async function getBusinessDetails(businessId: number) {
  try {
    // اطلاعات پایه کسب‌وکار
    const businessInfo = await query<any>(
      `
      SELECT 
        u.id,
        COALESCE(u.name, 'بدون نام') as name,
        u.phone,
        u.created_at as registration_date,
        COALESCE(j.persian_name, 'نامشخص') as job_title,
        COALESCE(p.title, 'بدون پلن') as plan_title,
        COALESCE(u.sms_balance, 0) as sms_balance,
        COALESCE(u.purchased_sms_credit, 0) as purchased_sms_credit
      FROM users u
      LEFT JOIN jobs j ON u.job_id = j.id
      LEFT JOIN plans p ON u.plan_key = p.plan_key
      WHERE u.id = ?
    `,
      [businessId]
    );

    if (businessInfo.length === 0) {
      return NextResponse.json(
        { success: false, message: "کسب‌وکار یافت نشد" },
        { status: 404 }
      );
    }

    const business = businessInfo[0];

    // آمار واقعی نوبت‌ها
    const bookingStats = await query<any>(
      `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(DISTINCT c.id) as total_customers,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM booking b
      LEFT JOIN clients c ON b.client_phone = c.client_phone AND b.user_id = c.user_id
      WHERE b.user_id = ?
        AND b.id > 0
    `,
      [businessId]
    );

    // آمار خدمات
    const serviceStats = await query<any>(
      `
      SELECT COUNT(*) as service_count
      FROM user_services
      WHERE user_id = ?
        AND is_active = 1
    `,
      [businessId]
    );

    const stats = {
      ...bookingStats[0],
      ...serviceStats[0],
    };

    const totalBookings = stats?.total_bookings || 0;
    const cancelledCount = stats?.cancelled_count || 0;
    const cancellationRate =
      totalBookings > 0
        ? Math.round((cancelledCount / totalBookings) * 100)
        : 0;

    // نوبت‌های اخیر (واقعی)
    const recentBookings = await query<any>(
      `
      SELECT 
        b.id,
        COALESCE(b.client_name, 'نامشخص') as client_name,
        b.booking_date,
        b.booking_time,
        b.status,
        COALESCE(b.services, '') as services,
        COALESCE(b.booking_description, '') as booking_description
      FROM booking b
      WHERE b.user_id = ?
        AND b.id > 0
      ORDER BY b.booking_date DESC, b.booking_time DESC
      LIMIT 5
    `,
      [businessId]
    );

    // خدمات محبوب (فقط اگر خدمات ثبت شده باشد)
    let popularServices: any[] = [];
    if (stats?.service_count > 0) {
      popularServices = await query<any>(
        `
        SELECT 
          s.name,
          COUNT(b.id) as booking_count
        FROM user_services s
        LEFT JOIN booking b ON FIND_IN_SET(s.id, REPLACE(b.services, ', ', ',')) > 0
        WHERE s.user_id = ?
          AND s.is_active = 1
          AND b.id > 0
        GROUP BY s.name
        ORDER BY booking_count DESC
        LIMIT 5
      `,
        [businessId]
      );
    }

    const details: BusinessDetails = {
      id: business.id,
      name: business.name,
      phone: business.phone,
      job_title: business.job_title,
      plan_title: business.plan_title,
      registration_date: business.registration_date,
      total_bookings: totalBookings,
      total_customers: stats?.total_customers || 0,
      cancellation_rate: cancellationRate,
      sms_balance: business.sms_balance,
      purchased_sms_credit: business.purchased_sms_credit,
      recent_bookings: recentBookings,
      popular_services: popularServices,
    };

    return NextResponse.json({
      success: true,
      business: details,
      message: "جزئیات با موفقیت دریافت شد",
    });
  } catch (error) {
    console.error("Error in getBusinessDetails:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت جزئیات" },
      { status: 500 }
    );
  }
}
