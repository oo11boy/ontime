// File Path: src\lib\sms-utils.ts

// src/lib/sms-utils.ts
import { query } from '@/lib/db';

export async function deductSms(userId: number, smsCount: number): Promise<boolean> {
  try {
    console.log(`🔄 کسر ${smsCount} پیامک از کاربر ${userId}`);
    
    // 1. ابتدا از بسته‌های خریداری شده کسر کنیم
    const activePackages = await query<any>(`
      SELECT id, remaining_sms 
      FROM smspurchase 
      WHERE user_id = ? 
        AND type = 'one_time_sms' 
        AND status = 'active'
        AND remaining_sms > 0
        AND (expires_at IS NULL OR expires_at >= CURDATE())
      ORDER BY created_at ASC
    `, [userId]);

    console.log(`📦 تعداد بسته‌های فعال: ${activePackages.length}`);
    
    let remainingDeduction = smsCount;
    let deductionsMade: Array<{pkgId: number, deducted: number, newBalance: number}> = [];

    for (const pkg of activePackages) {
      if (remainingDeduction <= 0) break;

      const deductionFromThisPackage = Math.min(pkg.remaining_sms, remainingDeduction);
      
      await query(
        `UPDATE smspurchase 
         SET remaining_sms = remaining_sms - ? 
         WHERE id = ?`,
        [deductionFromThisPackage, pkg.id]
      );

      deductionsMade.push({
        pkgId: pkg.id,
        deducted: deductionFromThisPackage,
        newBalance: pkg.remaining_sms - deductionFromThisPackage
      });

      remainingDeduction -= deductionFromThisPackage;
      console.log(`📦 کسر ${deductionFromThisPackage} پیامک از بسته ${pkg.id}`);
    }

    // 2. اگر هنوز پیامکی باقی مانده بود، از سهمیه پلن کسر کنیم
    if (remainingDeduction > 0) {
      console.log(`💰 کسر ${remainingDeduction} پیامک از سهمیه پلن`);
      await query(
        `UPDATE users 
         SET sms_balance = sms_balance - ? 
         WHERE id = ?`,
        [remainingDeduction, userId]
      );
    }

    console.log(`✅ کسر پیامک با موفقیت انجام شد. خلاصه:`, deductionsMade);
    return true;
  } catch (error) {
    console.error('❌ خطا در کسر پیامک:', error);
    return false;
  }
}

// تابع برای بررسی موجودی کل
export async function getTotalSmsBalance(userId: number): Promise<number> {
  try {
    const [result]: any = await query(`
      SELECT 
        COALESCE(u.sms_balance, 0) AS plan_balance,
        COALESCE(SUM(sp.remaining_sms), 0) AS purchased_balance
      FROM users u
      LEFT JOIN smspurchase sp ON sp.user_id = u.id 
        AND sp.type = 'one_time_sms' 
        AND sp.status = 'active'
        AND (sp.expires_at IS NULL OR sp.expires_at >= CURDATE())
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (!result) return 0;
    
    const totalBalance = result.plan_balance + result.purchased_balance;
    console.log(`💰 موجودی کل کاربر ${userId}: ${totalBalance} (پلن: ${result.plan_balance}, بسته‌ها: ${result.purchased_balance})`);
    return totalBalance;
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی:', error);
    return 0;
  }
}

// تابع برای دریافت جزئیات موجودی
export async function getSmsBalanceDetails(userId: number): Promise<{
  plan_balance: number;
  purchased_balance: number;
  total_balance: number;
}> {
  try {
    const [result]: any = await query(`
      SELECT 
        COALESCE(u.sms_balance, 0) AS plan_balance,
        COALESCE(SUM(sp.remaining_sms), 0) AS purchased_balance
      FROM users u
      LEFT JOIN smspurchase sp ON sp.user_id = u.id 
        AND sp.type = 'one_time_sms' 
        AND sp.status = 'active'
        AND (sp.expires_at IS NULL OR sp.expires_at >= CURDATE())
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (!result) {
      return { plan_balance: 0, purchased_balance: 0, total_balance: 0 };
    }
    
    const plan_balance = result.plan_balance || 0;
    const purchased_balance = result.purchased_balance || 0;
    const total_balance = plan_balance + purchased_balance;
    
    return { plan_balance, purchased_balance, total_balance };
  } catch (error) {
    console.error('❌ خطا در دریافت جزئیات موجودی:', error);
    return { plan_balance: 0, purchased_balance: 0, total_balance: 0 };
  }
}