import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

interface DbClient {
  id: number;
  name: string;
  phone: string;
  plan_title: string;
  sms_balance: number;
  purchased_sms_credit: number;
  sms_monthly_quota: number;
  trial_ends_at: string | null;
  quota_ends_at: string | null;
  created_at: string;
  job_id: number | null;
  job_persian_name: string | null;
}

interface SmsPackage {
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string | null;
}

interface FormattedClient {
  id: number;
  businessName: string;
  phone: string;
  plan: string;
  totalRemainingSms: number;
  planBalance: number;
  purchasedPackagesBalance: number;
  customerCount: number;
  status: "active" | "expired";
  jobTitle: string;
  registrationDate: string;
  hasCompleteProfile: boolean;
}

// GET: دریافت لیست کلاینت‌ها با فیلتر
export async function GET(request: NextRequest) {
  const handler = withAdminAuth(async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const filter = searchParams.get('filter') || 'all';
      const search = searchParams.get('search') || '';
      
      // 1. دریافت کاربران
      let queryStr = `
        SELECT 
          u.id,
          u.name,
          u.phone,
          p.title AS plan_title,
          u.sms_balance,
          u.purchased_sms_credit,
          u.sms_monthly_quota,
          u.trial_ends_at,
          u.quota_ends_at,
          u.created_at,
          u.job_id,
          j.persian_name AS job_persian_name
        FROM users u
        LEFT JOIN plans p ON u.plan_key = p.plan_key
        LEFT JOIN jobs j ON u.job_id = j.id
        WHERE u.id > 0
      `;
      
      const params: any[] = [];
      
      // اعمال فیلتر جستجو
      if (search) {
        queryStr += ` AND (
          u.name LIKE ? 
          OR u.phone LIKE ?
          OR j.persian_name LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      queryStr += ` ORDER BY u.created_at DESC`;
      
      const clients = await query<DbClient>(queryStr, params);

      // 2. دریافت بسته‌های پیامک خریداری شده برای هر کاربر
      const clientPackages: Record<number, SmsPackage[]> = {};
      
      if (clients.length > 0) {
        const userIds = clients.map(c => c.id);
        const placeholders = userIds.map(() => '?').join(',');
        
        const packages = await query<any>(`
          SELECT 
            user_id,
            sms_amount,
            remaining_sms,
            valid_from,
            expires_at
          FROM smspurchase 
          WHERE status = 'active' 
            AND user_id IN (${placeholders})
            AND (expires_at IS NULL OR expires_at > CURDATE())
        `, userIds);
        
        packages.forEach((pkg: any) => {
          if (!clientPackages[pkg.user_id]) {
            clientPackages[pkg.user_id] = [];
          }
          clientPackages[pkg.user_id].push({
            sms_amount: pkg.sms_amount,
            remaining_sms: pkg.remaining_sms,
            valid_from: pkg.valid_from,
            expires_at: pkg.expires_at
          });
        });
      }

      // 3. تعداد مشتری‌های هر کاربر
      const customerCountMap: Record<number, number> = {};
      if (clients.length > 0) {
        const userIds = clients.map(c => c.id);
        const placeholders = userIds.map(() => '?').join(',');
        
        const clientCounts = await query<any>(`
          SELECT user_id, COUNT(*) as customer_count
          FROM clients 
          WHERE user_id IN (${placeholders})
          GROUP BY user_id
        `, userIds);
        
        clientCounts.forEach((row: any) => {
          customerCountMap[row.user_id] = row.customer_count;
        });
      }

      // 4. فرمت نهایی با اعمال فیلتر
      let formattedClients: FormattedClient[] = clients.map((client) => {
        const packages = clientPackages[client.id] || [];
        
        const purchasedPackagesBalance = packages.reduce(
          (sum, pkg) => sum + pkg.remaining_sms,
          0
        );
        
        const totalRemainingSms = (client.sms_balance || 0) + purchasedPackagesBalance;
        const hasCompleteProfile = !!client.name?.trim() && client.job_id !== null;
        
        return {
          id: client.id,
          businessName: client.name?.trim() || 'ثبت‌نام ناقص',
          phone: client.phone || 'نامشخص',
          plan: client.plan_title || 'بدون پلن',
          totalRemainingSms,
          planBalance: client.sms_balance || 0,
          purchasedPackagesBalance,
          customerCount: customerCountMap[client.id] || 0,
          status: (client.trial_ends_at && new Date(client.trial_ends_at) > new Date()) || 
                  (client.quota_ends_at && new Date(client.quota_ends_at) > new Date()) 
                  ? 'active' : 'expired',
          jobTitle: client.job_persian_name || 'نامشخص',
          registrationDate: client.created_at,
          hasCompleteProfile
        };
      });

      // اعمال فیلتر وضعیت ثبت‌نام
      if (filter === 'complete') {
        formattedClients = formattedClients.filter(c => c.hasCompleteProfile);
      } else if (filter === 'incomplete') {
        formattedClients = formattedClients.filter(c => !c.hasCompleteProfile);
      }

      // آمار
      const stats = {
        total: clients.length,
        complete: clients.filter(c => !!c.name?.trim() && c.job_id !== null).length,
        incomplete: clients.filter(c => !c.name?.trim() || c.job_id === null).length
      };

      return NextResponse.json({
        success: true,
        clients: formattedClients,
        stats
      });
      
    } catch (error: any) {
      console.error("Error fetching admin clients:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست کلاینت‌ها" },
        { status: 500 }
      );
    }
  }, ['super_admin', 'editor', 'viewer']);

  return handler(request);
}

// DELETE: حذف کاربر
export async function DELETE(request: NextRequest) {
  const handler = withAdminAuth(async (req: NextRequest) => {
    try {
      const { id } = await req.json();
      
      if (!id) {
        return NextResponse.json(
          { success: false, message: "شناسه کاربر الزامی است" },
          { status: 400 }
        );
      }

      // بررسی وجود کاربر
      const user = await query<any>(`SELECT id FROM users WHERE id = ?`, [id]);
      if (user.length === 0) {
        return NextResponse.json(
          { success: false, message: "کاربر یافت نشد" },
          { status: 404 }
        );
      }

      // حذف مرتبه‌ای (cascade)
      await query(`DELETE FROM smslog WHERE user_id = ?`, [id]);
      await query(`DELETE FROM smspurchase WHERE user_id = ?`, [id]);
      await query(`DELETE FROM booking WHERE user_id = ?`, [id]);
      await query(`DELETE FROM clients WHERE user_id = ?`, [id]);
      await query(`DELETE FROM user_services WHERE user_id = ?`, [id]);
      await query(`DELETE FROM users WHERE id = ?`, [id]);

      return NextResponse.json({
        success: true,
        message: "کاربر با موفقیت حذف شد"
      });
      
    } catch (error: any) {
      console.error("Error deleting client:", error);
      return NextResponse.json(
        { success: false, message: "خطا در حذف کاربر" },
        { status: 500 }
      );
    }
  }, ['super_admin', 'editor']);

  return handler(request);
}

// PUT: ویرایش کاربر
export async function PUT(request: NextRequest) {
  const handler = withAdminAuth(async (req: NextRequest) => {
    try {
      const { id, name, phone, job_id } = await req.json();
      
      if (!id) {
        return NextResponse.json(
          { success: false, message: "شناسه کاربر الزامی است" },
          { status: 400 }
        );
      }

      // بررسی وجود کاربر
      const user = await query<any>(`SELECT id FROM users WHERE id = ?`, [id]);
      if (user.length === 0) {
        return NextResponse.json(
          { success: false, message: "کاربر یافت نشد" },
          { status: 404 }
        );
      }

      // ساخت کوئری آپدیت داینامیک
      const updates: string[] = [];
      const params: any[] = [];
      
      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name.trim());
      }
      
      if (phone !== undefined) {
        // بررسی تکراری نبودن شماره
        const existingPhone = await query<any>(
          `SELECT id FROM users WHERE phone = ? AND id != ?`,
          [phone, id]
        );
        
        if (existingPhone.length > 0) {
          return NextResponse.json(
            { success: false, message: "این شماره تماس قبلاً ثبت شده است" },
            { status: 409 }
          );
        }
        
        updates.push("phone = ?");
        params.push(phone);
      }
      
      if (job_id !== undefined) {
        updates.push("job_id = ?");
        params.push(job_id);
      }
      
      if (updates.length === 0) {
        return NextResponse.json(
          { success: false, message: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است" },
          { status: 400 }
        );
      }
      
      params.push(id);
      
      await query(
        `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );

      return NextResponse.json({
        success: true,
        message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد"
      });
      
    } catch (error: any) {
      console.error("Error updating client:", error);
      return NextResponse.json(
        { success: false, message: "خطا در به‌روزرسانی کاربر" },
        { status: 500 }
      );
    }
  }, ['super_admin', 'editor']);

  return handler(request);
}