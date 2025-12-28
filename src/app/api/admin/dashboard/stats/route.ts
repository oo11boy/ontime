import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth';

interface DashboardStats {
  totalClients: number;
  totalJobs: number;
  totalBookings: number;
  totalClientsCustomers: number;
  activePlans: number;
  totalRevenue: number;
  bookingsByStatus: {
    active: number;
    cancelled: number;
    done: number;
  };
  recentBookings: any[];
}

export const GET = withAdminAuth(async () => {
  try {
    // 1. تعداد کلاینت‌های ثبت‌نامی
    const clientsResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE id > 0`
    );
    const totalClients = clientsResult[0]?.count || 0;

    // 2. تعداد مشاغل ثبت‌شده
    const jobsResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM jobs`
    );
    const totalJobs = jobsResult[0]?.count || 0;

    // 3. تعداد کل نوبت‌ها
    const bookingsResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM booking`
    );
    const totalBookings = bookingsResult[0]?.count || 0;

    // 4. تعداد کل مشتریان کلاینت‌ها
    const customersResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM clients`
    );
    const totalClientsCustomers = customersResult[0]?.count || 0;

    // 5. تعداد پلن‌های فعال (کاربرانی که trial یا quota فعال دارند)
    const activePlansResult = await query<{ count: number }>(`
      SELECT COUNT(DISTINCT u.id) as count 
      FROM users u
      WHERE (u.ended_at > CURDATE() OR u.quota_ends_at > CURDATE())
        AND u.id > 0
    `);
    const activePlans = activePlansResult[0]?.count || 0;

    // 6. درآمد کل از خرید بسته‌های پیامک
    const revenueResult = await query<{ total: number }>(`
      SELECT COALESCE(SUM(amount_paid), 0) as total 
      FROM smspurchase 
      WHERE type = 'one_time_sms'
    `);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 7. نوبت‌ها بر اساس وضعیت
    const bookingsByStatus = await query<{ status: string; count: number }>(`
      SELECT status, COUNT(*) as count 
      FROM booking 
      GROUP BY status
    `);
    
    const statusCounts = {
      active: 0,
      cancelled: 0,
      done: 0
    };
    
    bookingsByStatus.forEach(item => {
      if (item.status === 'active') statusCounts.active = item.count;
      if (item.status === 'cancelled') statusCounts.cancelled = item.count;
      if (item.status === 'done') statusCounts.done = item.count;
    });

    // 8. آخرین نوبت‌های ثبت شده (۱۰ مورد)
    const recentBookings = await query<any>(`
      SELECT 
        b.id,
        b.client_name as user,
        b.booking_description as service,
        u.name as business,
        CONCAT(DATE_FORMAT(b.booking_time, '%H:%i'), ' - ', 
               CASE 
                 WHEN b.booking_date = CURDATE() THEN 'امروز'
                 WHEN b.booking_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'فردا'
                 WHEN b.booking_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) THEN 'پس‌فردا'
                 ELSE DATE_FORMAT(b.booking_date, '%Y/%m/%d')
               END) as time,
        b.status,
        '' as price
      FROM booking b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.booking_date >= CURDATE()
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    // 9. رشد ماهانه کاربران (برای نمودار آینده)
    const monthlyGrowth = await query<any>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `);

    const stats: DashboardStats = {
      totalClients,
      totalJobs,
      totalBookings,
      totalClientsCustomers,
      activePlans,
      totalRevenue,
      bookingsByStatus: statusCounts,
      recentBookings
    };

    return NextResponse.json({
      success: true,
      stats,
      monthlyGrowth
    });
    
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت آمار داشبورد" },
      { status: 500 }
    );
  }
}, ['super_admin', 'editor', 'viewer']);