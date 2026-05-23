// src/app/api/client/customer-link/analytics/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "week";

  try {
    // 1. دریافت اطلاعات لینک اختصاصی کاربر
    const customerLink = await query<any>(
      `SELECT id, slug, total_visits, unique_visitors 
       FROM customer_links 
       WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );

    if (!customerLink || customerLink.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalVisits: 0,
          uniqueVisitors: 0,
          todayVisits: 0,
          avgTimeOnPage: 0,
          bounceRate: 0,
          conversionRate: 0,
          totalBookings: 0,
          totalReviews: 0,
          socialClicks: { instagram: 0, telegram: 0, whatsapp: 0 },
          weeklyVisits: [0, 0, 0, 0, 0, 0, 0],
          deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
          popularHours: [],
        },
      });
    }

    const linkId = customerLink[0].id;
    const totalVisits = customerLink[0].total_visits || 0;
    const uniqueVisitors = customerLink[0].unique_visitors || 0;

    // 2. بازدید امروز
    const today = new Date().toISOString().split("T")[0];
    const todayVisitsResult = await query<any>(
      `SELECT COUNT(*) as count FROM link_visits 
       WHERE link_id = ? AND DATE(visited_at) = ?`,
      [linkId, today]
    );
    const todayVisits = todayVisitsResult[0]?.count || 0;

    // 3. میانگین زمان بازدید و نرخ پرش
    const avgStats = await query<any>(
      `SELECT AVG(time_on_page) as avg_time, 
              SUM(CASE WHEN time_on_page < 5 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as bounce_rate
       FROM link_visits 
       WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [linkId]
    );
    const avgTimeOnPage = Math.round(avgStats[0]?.avg_time || 0);
    const bounceRate = Math.round(avgStats[0]?.bounce_rate || 0);

    // 4. تعداد نوبت‌ها و نظرات
    const [bookingsResult, reviewsResult] = await Promise.all([
      query<any>(
        `SELECT COUNT(*) as count FROM booking 
         WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [userId]
      ),
      query<any>(
        `SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews 
         WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [userId]
      ),
    ]);

    const totalBookings = bookingsResult[0]?.count || 0;
    const totalReviews = reviewsResult[0]?.count || 0;
    const avgRating = reviewsResult[0]?.avg_rating || 0;

    // 5. نرخ تبدیل
    const conversionRate = uniqueVisitors > 0 
      ? Math.round((totalBookings / uniqueVisitors) * 100) 
      : 0;

    // 6. کلیک روی شبکه‌های اجتماعی
    const socialClicksResult = await query<any>(
      `SELECT social_type, COUNT(*) as count 
       FROM social_clicks 
       WHERE link_id = ? AND clicked_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY social_type`,
      [linkId]
    );

    const socialClicks = {
      instagram: 0,
      telegram: 0,
      whatsapp: 0,
    };
    socialClicksResult.forEach((row: any) => {
      if (row.social_type === "instagram") socialClicks.instagram = row.count;
      if (row.social_type === "telegram") socialClicks.telegram = row.count;
      if (row.social_type === "whatsapp") socialClicks.whatsapp = row.count;
    });

    // 7. بازدیدهای هفتگی/ماهانه
    let weeklyVisits: number[] = [];
    if (period === "week") {
      const weeklyResult = await query<any>(
        `SELECT DATE(visited_at) as date, COUNT(*) as count 
         FROM link_visits 
         WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY DATE(visited_at)
         ORDER BY date ASC`,
        [linkId]
      );
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });
      
      weeklyVisits = last7Days.map(date => {
        const found = weeklyResult.find((r: any) => r.date === date);
        return found ? found.count : 0;
      });
    } else {
      const monthlyResult = await query<any>(
        `SELECT DAY(visited_at) as day, COUNT(*) as count 
         FROM link_visits 
         WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DAY(visited_at)
         ORDER BY day ASC`,
        [linkId]
      );
      
      weeklyVisits = Array.from({ length: 30 }, (_, i) => {
        const found = monthlyResult.find((r: any) => r.day === i + 1);
        return found ? found.count : 0;
      });
    }

    // 8. آمار دستگاه‌ها
    const deviceStatsResult = await query<any>(
      `SELECT device_type, COUNT(*) as count 
       FROM link_visits 
       WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY device_type`,
      [linkId]
    );

    const totalDevices = deviceStatsResult.reduce((sum: number, r: any) => sum + r.count, 0);
    const deviceStats = {
      mobile: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "mobile")?.count || 0) / totalDevices * 100) : 0,
      desktop: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "desktop")?.count || 0) / totalDevices * 100) : 0,
      tablet: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "tablet")?.count || 0) / totalDevices * 100) : 0,
    };

    // 9. ساعات پربازدید
    const popularHoursResult = await query<any>(
      `SELECT HOUR(visited_at) as hour, COUNT(*) as count 
       FROM link_visits 
       WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY HOUR(visited_at)
       ORDER BY count DESC
       LIMIT 5`,
      [linkId]
    );

    const popularHours = popularHoursResult.map((row: any) => ({
      hour: row.hour,
      count: row.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        avgTimeOnPage,
        bounceRate,
        conversionRate,
        totalBookings,
        totalReviews,
        avgRating,
        socialClicks,
        weeklyVisits,
        deviceStats,
        popularHours,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
});