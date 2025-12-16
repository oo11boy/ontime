// File Path: src\app\api\client\auth\signup-complete\route.ts

// src/app/api/auth/signup-complete/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

// File Path: src\app\api\client\auth\signup-complete\route.ts
// اصلاح شده برای فعال‌سازی تریال 3 ماهه با 150 پیامک ماهانه

const POST = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;
  
  try {
    const { name, job_id } = await req.json();
    
    if (!name || !job_id) {
      return NextResponse.json({ message: 'نام و شاخه کاری الزامی است' }, { status: 400 });
    }
    
    const jobIdNumber = parseInt(job_id, 10);
    if (isNaN(jobIdNumber)) {
      return NextResponse.json({ message: 'شاخه کاری نامعتبر است' }, { status: 400 });
    }
    
    // بررسی وضعیت فعلی کاربر
    const userResult = await query<{ trial_starts_at: string | null, job_id: number | null, plan_key: string }>(
      'SELECT trial_starts_at, job_id, plan_key FROM users WHERE id = ?',
      [userId]
    );
    
    const user = userResult[0];
    const isFirstTimeCompletingSignup = !user?.trial_starts_at;
    const prevJobId = user?.job_id;
    const currentPlanKey = user?.plan_key || 'free_trial';
    
    let showWelcomeModal = false;
    
    if (isFirstTimeCompletingSignup) {
      // فعال‌سازی تریال 3 ماهه با 150 پیامک ماهانه
      const today = new Date().toISOString().split('T')[0];
      
      // محاسبه تاریخ‌ها برای تریال 3 ماهه
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 3);
      const trialEndsAt = trialEndDate.toISOString().split('T')[0];
      
      // محاسبه تاریخ‌های سهمیه ماهانه (ماه اول)
      const quotaEndDate = new Date();
      quotaEndDate.setMonth(quotaEndDate.getMonth() + 1);
      const quotaEndsAt = quotaEndDate.toISOString().split('T')[0];
      
      // 1. به‌روزرسانی اطلاعات کاربر و فعال‌سازی تریال
      await query(
        `UPDATE users 
         SET name = ?, 
             job_id = ?, 
             plan_key = 'free_trial',
             sms_monthly_quota = 150, 
             sms_balance = 150,
             purchased_sms_credit = 0,
             trial_starts_at = ?, 
             trial_ends_at = ?, 
             quota_starts_at = ?, 
             quota_ends_at = ?
         WHERE id = ?`,
        [name.trim(), jobIdNumber, today, trialEndsAt, today, quotaEndsAt, userId]
      );
      
      // 2. ثبت رکورد تریال در جدول smspurchase
      await query(
        `INSERT INTO smspurchase 
         (user_id, type, amount_paid, sms_amount, valid_from, valid_until, status)
         VALUES (?, 'trial_quota', 0, 150, ?, ?, 'active')`,
        [userId, today, trialEndsAt]
      );
      
      // 3. افزایش businessCount برای شغل انتخاب شده
      await query(
        'UPDATE jobs SET businessCount = businessCount + 1 WHERE id = ?',
        [jobIdNumber]
      );
      
      showWelcomeModal = true;
      
    } else {
      // اگر قبلاً تکمیل شده بود، فقط نام و شغل را به‌روزرسانی کن
      await query(
        'UPDATE users SET name = ?, job_id = ? WHERE id = ?',
        [name.trim(), jobIdNumber, userId]
      );
      
      // مدیریت تغییر businessCount
      if (prevJobId !== jobIdNumber) {
        if (prevJobId) {
          await query(
            'UPDATE jobs SET businessCount = businessCount - 1 WHERE id = ? AND businessCount > 0',
            [prevJobId]
          );
        }
        await query(
          'UPDATE jobs SET businessCount = businessCount + 1 WHERE id = ?',
          [jobIdNumber]
        );
      }
    }
    
    return NextResponse.json({ 
      message: 'ثبت‌نام با موفقیت تکمیل شد.',
      show_welcome_modal: showWelcomeModal 
    });
    
  } catch (error) {
    console.error('Signup complete error:', error);
    return NextResponse.json({ message: 'خطا در سرور.' }, { status: 500 });
  }
});

export { POST };