// src/app/api/admin/dashboard/app-install-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const GET = withAdminAuth(
  async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const period = url.searchParams.get("period") || "all";

      console.log("=== App Install Stats API ===");
      console.log("Period:", period);

      // ===== تست ساده: ببینیم اصلاً داده داریم یا نه =====
      // تست 1: تعداد رکوردهای users
      const userCountResult = await query<any>(
        "SELECT COUNT(*) as total FROM users WHERE app_downloaded_at IS NOT NULL"
      );
      console.log("Direct user count:", userCountResult);

      // تست 2: تعداد رکوردهای staffs
      const staffCountResult = await query<any>(
        "SELECT COUNT(*) as total FROM staffs WHERE app_downloaded_at IS NOT NULL"
      );
      console.log("Direct staff count:", staffCountResult);

      // تست 3: لیست کامل users
      const allUsers = await query<any>(
        "SELECT id, name, app_downloaded_at FROM users WHERE app_downloaded_at IS NOT NULL ORDER BY app_downloaded_at DESC"
      );

      // تست 4: لیست کامل staffs
      const allStaffs = await query<any>(
        "SELECT s.id, s.name, s.app_downloaded_at, u.business_name FROM staffs s LEFT JOIN users u ON s.owner_user_id = u.id WHERE s.app_downloaded_at IS NOT NULL ORDER BY s.app_downloaded_at DESC"
      );
   

      // ===== محاسبه آمار نهایی =====
      const userCount = userCountResult?.[0]?.total || 0;
      const staffCount = staffCountResult?.[0]?.total || 0;
      const totalInstalls = userCount + staffCount;

      // ===== آمار بر اساس بازه زمانی =====
      let dateFilter = "";
      if (period === "today") {
        dateFilter = "AND DATE(app_downloaded_at) = CURDATE()";
      } else if (period === "week") {
        dateFilter = "AND app_downloaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      } else if (period === "month") {
        dateFilter = "AND app_downloaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      }

      // آمار فیلتر شده
      const [filteredUsers] = await query<any>(
        `SELECT COUNT(*) as count FROM users WHERE app_downloaded_at IS NOT NULL ${dateFilter}`
      );
      const [filteredStaffs] = await query<any>(
        `SELECT COUNT(*) as count FROM staffs WHERE app_downloaded_at IS NOT NULL ${dateFilter}`
      );

      const filteredUserCount = filteredUsers?.[0]?.count || 0;
      const filteredStaffCount = filteredStaffs?.[0]?.count || 0;

      // ===== آمار روزانه ۳۰ روز اخیر =====
      const dailyStats = await query<any>(
        `SELECT 
          DATE(app_downloaded_at) as date,
          COUNT(*) as total
        FROM (
          SELECT app_downloaded_at FROM users WHERE app_downloaded_at IS NOT NULL
          UNION ALL
          SELECT app_downloaded_at FROM staffs WHERE app_downloaded_at IS NOT NULL
        ) as all_installs
        WHERE app_downloaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(app_downloaded_at)
        ORDER BY date ASC`
      );

      // ===== نصب‌های امروز =====
      const [todayUsers] = await query<any>(
        "SELECT COUNT(*) as count FROM users WHERE DATE(app_downloaded_at) = CURDATE()"
      );
      const [todayStaffs] = await query<any>(
        "SELECT COUNT(*) as count FROM staffs WHERE DATE(app_downloaded_at) = CURDATE()"
      );

      // ===== آخرین نصب‌ها =====
      const recentInstalls = await query<any>(
        `SELECT 
          'user' as type,
          u.id,
          u.name,
          u.business_name,
          u.phone,
          u.app_downloaded_at as installed_at
        FROM users u
        WHERE u.app_downloaded_at IS NOT NULL
        UNION ALL
        SELECT 
          'staff' as type,
          s.id,
          s.name,
          u.business_name,
          s.phone,
          s.app_downloaded_at as installed_at
        FROM staffs s
        LEFT JOIN users u ON s.owner_user_id = u.id
        WHERE s.app_downloaded_at IS NOT NULL
        ORDER BY installed_at DESC
        LIMIT 20`
      );

      const response = {
        success: true,
        stats: {
          total: totalInstalls,
          filteredTotal: period === "all" ? totalInstalls : filteredUserCount + filteredStaffCount,
          users: userCount,
          staffs: staffCount,
          filteredUsers: filteredUserCount,
          filteredStaffs: filteredStaffCount,
          today: {
            total: (todayUsers?.[0]?.count || 0) + (todayStaffs?.[0]?.count || 0),
            users: todayUsers?.[0]?.count || 0,
            staffs: todayStaffs?.[0]?.count || 0,
          }
        },
        dailyStats: dailyStats || [],
        recentInstalls: recentInstalls || [],
        period,
        debug: {
          rawUserCount: userCountResult,
          rawStaffCount: staffCountResult,
          allUsers: allUsers,
          allStaffs: allStaffs
        }
      };

      console.log("Final response:", {
        total: response.stats.total,
        users: response.stats.users,
        staffs: response.stats.staffs,
        recentCount: response.recentInstalls.length
      });

      return NextResponse.json(response);
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت آمار", error: String(error) },
        { status: 500 }
      );
    }
  },
  ["super_admin", "editor"]
);