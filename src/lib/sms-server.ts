// File Path: src/lib/sms-server.ts
import "server-only"; 
import { query } from "@/lib/db";
// در src/lib/sms-queue.ts، تابع refundSmsCost را به این شکل اصلاح کنید:

export default async function refundSmsCost(logId: number, cost: number, userId: number, staffId: number | null = null) {
  try {
    console.log(`💰 Refunding ${cost} SMS credits for log ${logId} (User: ${userId}, Staff: ${staffId || "N/A"})`);
    
    if (staffId) {
      // بازگرداندن به حساب پرسنل
      await query(
        `UPDATE staffs 
         SET sms_balance = sms_balance + ?, 
             sms_used = sms_used - ?,
             updated_at = NOW()
         WHERE id = ? AND owner_user_id = ?`,
        [cost, cost, staffId, userId]
      );
    } else {
      // بازگرداندن به حساب رییس
      // 1. ابتدا به بسته‌های خریداری شده برگردان (به صورت LIFO - آخرین بسته)
      let remainingRefund = cost;
      
      const recentPackages = await query<any>(
        `SELECT id, remaining_sms FROM smspurchase 
         WHERE user_id = ? AND type = 'one_time_sms' AND status = 'active'
         ORDER BY created_at DESC`,
        [userId]
      );
      
      for (const pkg of recentPackages) {
        if (remainingRefund <= 0) break;
        const addToPackage = Math.min(remainingRefund, pkg.remaining_sms + 10000); // حداکثر منطقی
        await query(
          `UPDATE smspurchase SET remaining_sms = remaining_sms + ? WHERE id = ?`,
          [remainingRefund, pkg.id]
        );
        remainingRefund = 0;
      }
      
      // اگر هنوز باقی مانده، به اعتبار ماهانه برگردان
      if (remainingRefund > 0) {
        await query(
          `UPDATE users SET sms_balance = sms_balance + ? WHERE id = ?`,
          [remainingRefund, userId]
        );
      }
    }
    
    await query(
      `UPDATE smslog SET status = 'refunded', error_message = CONCAT(IFNULL(error_message, ''), ' - اعتبار برگشت داده شد') WHERE id = ?`,
      [logId]
    );
    
    console.log(`✅ Successfully refunded ${cost} credits for log ${logId}`);
  } catch (refundError) {
    console.error(`❌ Failed to refund SMS cost for log ${logId}:`, refundError);
  }
}
// تابع دریافت اطلاعات پرسنل از کوکی یا پارامتر
async function getStaffInfo(userId: number, staffId?: number | null) {
  // اگر staffId نداشته باشیم، کاربر معمولی است
  if (!staffId) {
    return { type: "owner", userId, ownerId: userId, staffId: null };
  }
  
  // پرسنل: اطلاعات را از دیتابیس بگیر
  const staff = await query<any>(
    `SELECT s.*, u.id as owner_id 
     FROM staffs s 
     JOIN users u ON s.owner_user_id = u.id 
     WHERE s.id = ? AND s.is_active = 1`,
    [staffId]
  );
  
  if (!staff || staff.length === 0) {
    return { type: "owner", userId, ownerId: userId, staffId: null };
  }
  
  const staffData = staff[0];
  // بررسی اینکه userId درخواستی با مالک پرسنل مطابقت دارد
  if (staffData.owner_id !== userId) {
    return { type: "owner", userId, ownerId: userId, staffId: null };
  }
  
  return {
    type: "staff",
    userId: staffId, // برای پرسنل، userId معادل staffId است
    ownerId: staffData.owner_id,
    staffId: staffData.id,
    staffBalance: staffData.sms_balance,
    staffUsed: staffData.sms_used,
  };
}

/**
 * کسر موجودی هوشمند با پشتیبانی از پرسنل
 * @param userId - آیدی کاربر اصلی (مالک مجموعه)
 * @param smsCount - تعداد پیامک مورد نیاز
 * @param staffId - آیدی پرسنل (اختیاری)
 */
export async function deductSms(userId: number, smsCount: number, staffId?: number | null): Promise<boolean> {
  try {
    const staffInfo = await getStaffInfo(userId, staffId);
    
    // اگر پرسنل هستیم، ابتدا از بسته اختصاصی پرسنل کسر کن
    if (staffInfo.type === "staff" && staffInfo.staffId) {
      const currentStaff = await query<any>(
        "SELECT sms_balance FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [staffInfo.staffId, staffInfo.ownerId]
      );
      
      const staffBalance = currentStaff[0]?.sms_balance || 0;
      
      if (staffBalance >= smsCount) {
        // کسر از بسته اختصاصی پرسنل
        await query(
          `UPDATE staffs 
           SET sms_balance = sms_balance - ?, 
               sms_used = sms_used + ?,
               updated_at = NOW()
           WHERE id = ? AND owner_user_id = ? AND is_active = 1`,
          [smsCount, smsCount, staffInfo.staffId, staffInfo.ownerId]
        );
        return true;
      } else {
        // اعتبار پرسنل کافی نیست - خطا بده
        throw new Error(`موجودی پیامک پرسنل شما به پایان رسیده است (${staffBalance} واحد باقی مانده، نیاز: ${smsCount} واحد). لطفاً با مدیریت مجموعه تماس بگیرید.`);
      }
    }
    
    // در غیر این صورت، کاربر معمولی (رییس) است
    // 1. کسر از بسته‌های خریداری شده یک‌بارمصرف
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

    // 2. کسر از اعتبار ماهانه (sms_balance)
    if (remaining > 0) {
      const userBalance = await query<any>(
        "SELECT sms_balance FROM users WHERE id = ?",
        [userId]
      );
      
      if ((userBalance[0]?.sms_balance || 0) < remaining) {
        throw new Error(`موجودی پیامک مجموعه شما کافی نیست. نیاز: ${remaining} واحد، موجودی: ${userBalance[0]?.sms_balance || 0}`);
      }
      
      await query(`UPDATE users SET sms_balance = GREATEST(0, sms_balance - ?) WHERE id = ?`, [remaining, userId]);
    }
    
    return true;
  } catch (error) {
    console.error("[deductSms] Error:", error);
    throw error; // پرتاب خطا به بالا
  }
}

/**
 * دریافت جزئیات دقیق موجودی (با پشتیبانی از پرسنل)
 */
export async function getSmsBalanceDetails(userId: number, staffId?: number | null) {
  try {
    const staffInfo = await getStaffInfo(userId, staffId);
    
    // اگر پرسنل هستیم، موجودی پرسنل را برگردان
    if (staffInfo.type === "staff" && staffInfo.staffId) {
      const staff = await query<any>(
        "SELECT sms_balance, sms_used FROM staffs WHERE id = ?",
        [staffInfo.staffId]
      );
      
      const balance = staff[0]?.sms_balance || 0;
      const used = staff[0]?.sms_used || 0;
      
      return {
        plan_balance: 0,
        purchased_balance: balance,
        total_balance: balance,
        used: used,
        userType: "staff",
        staffId: staffInfo.staffId,
      };
    }
    
    // کاربر معمولی (رییس)
    const [result]: any = await query(
      `SELECT 
        COALESCE(u.sms_balance, 0) AS plan_balance,
        COALESCE((SELECT SUM(remaining_sms) FROM smspurchase WHERE user_id = u.id AND status = 'active' AND (expires_at IS NULL OR expires_at >= CURDATE())), 0) AS purchased_balance
      FROM users u WHERE u.id = ?`,
      [userId]
    );
    const plan = Number(result?.plan_balance || 0);
    const purchased = Number(result?.purchased_balance || 0);
    
    return {
      plan_balance: plan,
      purchased_balance: purchased,
      total_balance: plan + purchased,
      userType: "owner",
    };
  } catch (error) {
    console.error("[getSmsBalanceDetails] Error:", error);
    return { plan_balance: 0, purchased_balance: 0, total_balance: 0, userType: "owner" };
  }
}

/**
 * بررسی موجودی کافی (با خطای اختصاصی برای پرسنل)
 */
export async function checkSmsBalance(userId: number, requiredCount: number, staffId?: number | null): Promise<{ hasEnough: boolean; message?: string }> {
  try {
    const staffInfo = await getStaffInfo(userId, staffId);
    
    if (staffInfo.type === "staff" && staffInfo.staffId) {
      const staff = await query<any>(
        "SELECT sms_balance FROM staffs WHERE id = ?",
        [staffInfo.staffId]
      );
      const currentBalance = staff[0]?.sms_balance || 0;
      
      if (currentBalance < requiredCount) {
        return {
          hasEnough: false,
          message: `موجودی پیامک پرسنل شما به پایان رسیده است (${currentBalance} واحد باقی مانده، نیاز: ${requiredCount} واحد). لطفاً با مدیریت مجموعه تماس بگیرید.`
        };
      }
      return { hasEnough: true };
    }
    
    // بررسی برای رییس
    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < requiredCount) {
      return {
        hasEnough: false,
        message: `موجودی پیامک مجموعه شما کافی نیست. نیاز: ${requiredCount} واحد، موجودی: ${balance.total_balance} واحد.`
      };
    }
    return { hasEnough: true };
  } catch (error) {
    console.error("[checkSmsBalance] Error:", error);
    return { hasEnough: false, message: "خطا در بررسی موجودی پیامک" };
  }
}