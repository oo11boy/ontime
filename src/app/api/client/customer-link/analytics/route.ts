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
          avgRating: 0,
          socialClicks: { instagram: 0, telegram: 0, whatsapp: 0, rubika: 0, eitaa: 0, bale: 0, soroush: 0 },
          weeklyVisits: [0, 0, 0, 0, 0, 0, 0],
          deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
          popularHours: [],
        },
      });
    }

    const linkId = customerLink[0].id;
    const totalVisits = customerLink[0].total_visits || 0;
    const uniqueVisitors = customerLink[0].unique_visitors || 0;

    // 2. بازدید امروز - با استفاده از DATE در دیتابیس
    const todayVisitsResult = await query<any>(
      `SELECT COUNT(*) as count FROM link_visits 
       WHERE link_id = ? AND DATE(visited_at) = CURDATE()`,
      [linkId]
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
    const conversionRate = totalVisits > 0 
      ? Math.round((totalBookings / totalVisits) * 100) 
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
      rubika: 0,
      eitaa: 0,
      bale: 0,
      soroush: 0,
    };
    socialClicksResult.forEach((row: any) => {
      if (socialClicks.hasOwnProperty(row.social_type)) {
        socialClicks[row.social_type as keyof typeof socialClicks] = row.count;
      }
    });

    // 7. بازدیدهای هفتگی - اصلاح شده
    let weeklyVisits: number[] = [0, 0, 0, 0, 0, 0, 0];
    
    if (period === "week") {
      // گرفتن بازدیدهای 7 روز گذشته با فرمت صحیح
      const weeklyResult = await query<any>(
        `SELECT 
          DATE(visited_at) as visit_date, 
          COUNT(*) as count 
         FROM link_visits 
         WHERE link_id = ? 
           AND visited_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         GROUP BY DATE(visited_at)`,
        [linkId]
      );
      
      // ساخت آرایه 7 روز (از 6 روز پیش تا امروز)
      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        weekDays.push(dateStr);
      }
      
      // پر کردن آرایه بازدیدها
      weeklyVisits = weekDays.map(date => {
        const found = weeklyResult.find((r: any) => {
          const rDate = r.visit_date instanceof Date 
            ? r.visit_date.toISOString().split('T')[0] 
            : new Date(r.visit_date).toISOString().split('T')[0];
          return rDate === date;
        });
        return found ? parseInt(found.count) : 0;
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
      hour: row.hour.toString().padStart(2, '0') + ':00',
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