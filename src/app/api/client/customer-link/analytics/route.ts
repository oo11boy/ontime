import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

function getEmptyData() {
  return {
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
    shareClicks: { total: 0, native_share: 0, copy_link: 0 },
    weeklyVisits: [0, 0, 0, 0, 0, 0, 0],
    deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
    popularHours: [],
    trafficSources: [],
    topCities: [],
    browsers: [],
    osStats: [],
    avgTimeAccurate: 0,
    avgScrollDepth: 0,
  };
}

function getSourcePersianName(source: string): string {
  const names: Record<string, string> = {
    direct: '🔵 مستقیم',
    google: '🟡 گوگل',
    bing: '🔵 بینگ',
    yahoo: '🟣 یاهو',
    telegram: '💬 تلگرام',
    whatsapp: '💚 واتساپ',
    instagram: '📷 اینستاگرام',
    bale: '💬 بله',
    soroush: '💬 سروش',
    eitaa: '💬 ایتا',
    rubika: '💬 روبیکا',
    facebook: '📘 فیسبوک',
    twitter: '🐦 توییتر',
    linkedin: '🔗 لینکدین',
    aparat: '🎬 آپارات',
    chrome: '🌐 کروم',
    firefox: '🦊 فایرفاکس',
    safari: '🧭 سافاری',
    edge: '🔷 اج',
    other_website: '📎 سایر سایت‌ها',
    other: '📎 سایر',
    unknown: '❓ نامشخص',
  };
  return names[source] || source;
}

function detectSourceFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('telegram')) return 'telegram';
  if (ua.includes('whatsapp')) return 'whatsapp';
  if (ua.includes('instagram')) return 'instagram';
  if (ua.includes('bale')) return 'bale';
  if (ua.includes('soroush') || ua.includes('splus')) return 'soroush';
  if (ua.includes('eitaa')) return 'eitaa';
  if (ua.includes('rubika')) return 'rubika';
  if (ua.includes('google')) return 'google';
  return 'other';
}

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "week";

  try {
    const customerLink = await query<any>(
      `SELECT id, total_visits, unique_visitors FROM customer_links WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );
    if (!customerLink?.length) {
      return NextResponse.json({ success: true, data: getEmptyData() });
    }

    const linkId = customerLink[0].id;
    const totalVisits = Number(customerLink[0].total_visits) || 0;
    const uniqueVisitors = Number(customerLink[0].unique_visitors) || 0;

    // 1) منابع ترافیک (بر اساس traffic_source و utm_source)
    const allVisits = await query<any>(
      `SELECT utm_source, traffic_source, user_agent FROM link_visits WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [linkId]
    );
    const sourceMap = new Map<string, number>();
    allVisits.forEach((visit: any) => {
      let source = visit.traffic_source || visit.utm_source;
      if (!source || source === '') source = detectSourceFromUserAgent(visit.user_agent);
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });
    const totalSources = allVisits.length;
    const trafficSources = Array.from(sourceMap.entries())
      .map(([source, count]) => ({
        source,
        sourcePersian: getSourcePersianName(source),
        count,
        percentage: totalSources > 0 ? Math.round((count / totalSources) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2) سایر کوئری‌ها
    const [
      todayVisitsResult,
      avgStats,
      bookingsResult,
      reviewsResult,
      socialClicksResult,
      shareClicksResult,
      deviceStatsResult,
      popularHoursResult,
      weeklyResult,
      topCitiesResult,
      browsersResult,
      osStatsResult,
      accurateTimeResult,
      scrollDepthResult,
    ] = await Promise.all([
      query<any>(`SELECT COUNT(*) as count FROM link_visits WHERE link_id = ? AND DATE(visited_at) = CURDATE()`, [linkId]),
      query<any>(`SELECT ROUND(AVG(time_on_page)) as avg_time, ROUND(SUM(CASE WHEN time_on_page < 10 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as bounce_rate FROM link_visits WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`, [linkId]),
      query<any>(`SELECT COUNT(*) as count FROM booking WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`, [userId]),
      query<any>(`SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating FROM reviews WHERE user_id = ?`, [userId]),
      query<any>(`SELECT social_type, COUNT(*) as count FROM social_clicks WHERE link_id = ? GROUP BY social_type`, [linkId]),
      query<any>(`SELECT social_type, COUNT(*) as count FROM social_clicks WHERE link_id = ? AND social_type IN ('share', 'copy_link', 'native_share') GROUP BY social_type`, [linkId]),
      query<any>(`SELECT device_type, COUNT(*) as count FROM link_visits WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY device_type`, [linkId]),
      query<any>(`SELECT HOUR(visited_at) as hour, COUNT(*) as count FROM link_visits WHERE link_id = ? AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY HOUR(visited_at) ORDER BY count DESC LIMIT 6`, [linkId]),
      period === "week" ? query<any>(`SELECT DATE(visited_at) as visit_date, COUNT(*) as count FROM link_visits WHERE link_id = ? AND visited_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(visited_at)`, [linkId]) : Promise.resolve([]),
      query<any>(`SELECT city, COUNT(*) as count FROM link_visits WHERE link_id = ? AND city IS NOT NULL AND city != '' GROUP BY city ORDER BY count DESC LIMIT 4`, [linkId]),
      query<any>(`SELECT browser, COUNT(*) as count FROM link_visits WHERE link_id = ? AND browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 3`, [linkId]),
      query<any>(`SELECT os, COUNT(*) as count FROM link_visits WHERE link_id = ? AND os IS NOT NULL GROUP BY os ORDER BY count DESC LIMIT 3`, [linkId]),
      query<any>(`SELECT ROUND(AVG(total_active_time)) as avg_time FROM session_time_tracking WHERE link_id = ?`, [linkId]),
      query<any>(`SELECT ROUND(AVG(scroll_depth)) as avg_depth FROM link_visits WHERE link_id = ? AND scroll_depth > 0 AND visited_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`, [linkId]),
    ]);

    const todayVisits = Number(todayVisitsResult[0]?.count) || 0;
    const avgTimeOnPage = Number(avgStats[0]?.avg_time) || 0;
    const bounceRate = Number(avgStats[0]?.bounce_rate) || 0;
    const avgTimeAccurate = Number(accurateTimeResult[0]?.avg_time) || 0;
    const avgScrollDepth = Number(scrollDepthResult[0]?.avg_depth) || 0;
    const totalBookings = Number(bookingsResult[0]?.count) || 0;
    const totalReviews = Number(reviewsResult[0]?.count) || 0;
    const avgRating = Number(reviewsResult[0]?.avg_rating) || 0;
    const conversionRate = totalVisits > 0 ? Math.round((totalBookings / totalVisits) * 100) : 0;

    const socialClicks = { instagram: 0, telegram: 0, whatsapp: 0, rubika: 0, eitaa: 0, bale: 0, soroush: 0 };
    socialClicksResult.forEach((row: any) => {
      if (socialClicks.hasOwnProperty(row.social_type)) socialClicks[row.social_type as keyof typeof socialClicks] = Number(row.count);
    });

    const shareClicks = { total: 0, native_share: 0, copy_link: 0 };
    shareClicksResult.forEach((row: any) => {
      const count = Number(row.count);
      shareClicks.total += count;
      if (row.social_type === 'native_share') shareClicks.native_share = count;
      if (row.social_type === 'copy_link') shareClicks.copy_link = count;
    });

    let weeklyVisits: number[] = [0, 0, 0, 0, 0, 0, 0];
    if (period === "week" && weeklyResult.length > 0) {
      const visitsMap = new Map(weeklyResult.map((r: any) => [new Date(r.visit_date).toISOString().split('T')[0], Number(r.count)]));
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        weeklyVisits[i] = visitsMap.get(dateStr) || 0;
      }
    }

    const totalDevices = deviceStatsResult.reduce((sum: number, r: any) => sum + Number(r.count), 0);
    const deviceStats = {
      mobile: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "mobile")?.count || 0) / totalDevices * 100) : 0,
      desktop: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "desktop")?.count || 0) / totalDevices * 100) : 0,
      tablet: totalDevices > 0 ? Math.round((deviceStatsResult.find((r: any) => r.device_type === "tablet")?.count || 0) / totalDevices * 100) : 0,
    };

    const popularHours = popularHoursResult.map((row: any) => ({ hour: Number(row.hour), count: Number(row.count) }));
    const topCities = topCitiesResult.map((row: any) => ({ name: row.city, count: Number(row.count) }));
    const browsers = browsersResult.map((row: any) => ({ name: row.browser, count: Number(row.count) }));
    const osStats = osStatsResult.map((row: any) => ({ name: row.os, count: Number(row.count) }));

    return NextResponse.json({
      success: true,
      data: {
        totalVisits, uniqueVisitors, todayVisits, avgTimeOnPage, bounceRate, conversionRate,
        totalBookings, totalReviews, avgRating, socialClicks, shareClicks, weeklyVisits,
        deviceStats, popularHours, trafficSources, topCities, browsers, osStats,
        avgTimeAccurate, avgScrollDepth,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ success: false, message: "خطا در دریافت آمار" }, { status: 500 });
  }
});