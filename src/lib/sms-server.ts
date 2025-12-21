// File Path: src/lib/sms-server.ts
import "server-only"; 
import { query } from "@/lib/db";

/**
 * کسر موجودی هوشمند با جلوگیری از منفی شدن
 */
export async function deductSms(userId: number, smsCount: number): Promise<boolean> {
  try {
    const activePackages = await query<any>(
      `SELECT id, remaining_sms FROM smspurchase 
       WHERE user_id = ? AND type = 'one_time_sms' AND status = 'active'
       AND remaining_sms > 0 AND (expires_at IS NULL OR expires_at >= CURDATE())
       ORDER BY created_at ASC`,
      [userId]
    );

    let remaining = smsCount;
    for (const pkg of activePackages) {
      if (remaining <= 0) break;
      const take = Math.min(pkg.remaining_sms, remaining);
      await query(`UPDATE smspurchase SET remaining_sms = remaining_sms - ? WHERE id = ?`, [take, pkg.id]);
      remaining -= take;
    }

    if (remaining > 0) {
      await query(`UPDATE users SET sms_balance = GREATEST(0, sms_balance - ?) WHERE id = ?`, [remaining, userId]);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * دریافت جزئیات دقیق موجودی از دیتابیس
 */
export async function getSmsBalanceDetails(userId: number) {
  try {
    const [result]: any = await query(
      `SELECT 
        COALESCE(u.sms_balance, 0) AS plan_balance,
        COALESCE((SELECT SUM(remaining_sms) FROM smspurchase WHERE user_id = u.id AND status = 'active' AND (expires_at IS NULL OR expires_at >= CURDATE())), 0) AS purchased_balance
      FROM users u WHERE u.id = ?`,
      [userId]
    );
    const plan = Number(result?.plan_balance || 0);
    const purchased = Number(result?.purchased_balance || 0);
    return { plan_balance: plan, purchased_balance: purchased, total_balance: plan + purchased };
  } catch {
    return { plan_balance: 0, purchased_balance: 0, total_balance: 0 };
  }
}