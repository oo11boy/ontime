import { query } from "@/lib/db";

/**
 * نسخه قدیمی (دست نخورده – فقط برای سازگاری)
 */
export async function sendSingleSmsOld({
  userId,
  to_phone,
  content,
  sms_type = "other",
  booking_id = null,
}: {
  userId: number;
  to_phone: string;
  content: string;
  sms_type?: string;
  booking_id?: number | null;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        to_phone,
        content,
        sms_type,
        booking_id,
      }),
    });

    const data = await res.json();
    return res.ok && data.success;
  } catch {
    return false;
  }
}

/**
 * ✅ تابع اصلی صحیح
 * - بدون userId
 * - احراز هویت با کوکی
 * - چک موجودی + کسر + لاگ همگی در api
 */
export async function sendSingleSms({
  to_phone,
  content,
  sms_type = "other",
  booking_id = null,
}: {
  to_phone: string;
  content: string;
  sms_type?: string;
  booking_id?: number | null;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ⭐ حیاتی
      body: JSON.stringify({
        to_phone,
        content,
        sms_type,
        booking_id,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || "خطا در ارسال پیامک",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("❌ خطا در sendSingleSms:", error);
    return { success: false, message: "خطای ارتباط با سرور پیامک" };
  }
}

/* ===========================
   توابع دیتابیس (بدون تغییر)
   =========================== */

export async function deductSms(
  userId: number,
  smsCount: number
): Promise<boolean> {
  try {
    const activePackages = await query<any>(
      `
      SELECT id, remaining_sms 
      FROM smspurchase 
      WHERE user_id = ? 
        AND type = 'one_time_sms' 
        AND status = 'active'
        AND remaining_sms > 0
        AND (expires_at IS NULL OR expires_at >= CURDATE())
      ORDER BY created_at ASC
    `,
      [userId]
    );

    let remaining = smsCount;

    for (const pkg of activePackages) {
      if (remaining <= 0) break;

      const take = Math.min(pkg.remaining_sms, remaining);
      await query(
        `UPDATE smspurchase SET remaining_sms = remaining_sms - ? WHERE id = ?`,
        [take, pkg.id]
      );

      remaining -= take;
    }

    if (remaining > 0) {
      await query(
        `UPDATE users SET sms_balance = sms_balance - ? WHERE id = ?`,
        [remaining, userId]
      );
    }

    return true;
  } catch {
    return false;
  }
}

export async function getTotalSmsBalance(userId: number): Promise<number> {
  try {
    const [result]: any = await query(
      `
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
    `,
      [userId]
    );

    if (!result) return 0;
    return result.plan_balance + result.purchased_balance;
  } catch {
    return 0;
  }
}

export async function getSmsBalanceDetails(userId: number): Promise<{
  plan_balance: number;
  purchased_balance: number;
  total_balance: number;
}> {
  try {
    const [result]: any = await query(
      `
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
    `,
      [userId]
    );

    if (!result) {
      return { plan_balance: 0, purchased_balance: 0, total_balance: 0 };
    }

    const plan_balance = result.plan_balance || 0;
    const purchased_balance = result.purchased_balance || 0;

    return {
      plan_balance,
      purchased_balance,
      total_balance: plan_balance + purchased_balance,
    };
  } catch {
    return { plan_balance: 0, purchased_balance: 0, total_balance: 0 };
  }
}
