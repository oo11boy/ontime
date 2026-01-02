import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const POST = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;

  try {
    const { name, job_id } = await req.json();

    if (!name || !job_id) {
      return NextResponse.json(
        { message: "نام و شاخه کاری الزامی است" },
        { status: 400 }
      );
    }

    const jobIdNumber = parseInt(job_id, 10);
    if (isNaN(jobIdNumber)) {
      return NextResponse.json(
        { message: "شاخه کاری نامعتبر است" },
        { status: 400 }
      );
    }

    // ۱. بررسی وضعیت فعلی کاربر
    const userResult = await query<{
      started_at: string | null;
      job_id: number | null;
    }>("SELECT started_at, job_id FROM users WHERE id = ?", [userId]);

    const user = userResult[0];
    const isFirstTimeCompletingSignup = !user?.started_at;
    const prevJobId = user?.job_id;

    let showWelcomeModal = false;

    if (isFirstTimeCompletingSignup) {
      const MONTHLY_SMS_QUOTA = 150;
      const PLAN_DURATION_MONTHS = 2;

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const endDate = new Date();
      endDate.setMonth(today.getMonth() + PLAN_DURATION_MONTHS);
      const endedAtStr = endDate.toISOString().split("T")[0];

      const quotaEndDate = new Date();
      quotaEndDate.setMonth(today.getMonth() + 1);
      const quotaEndsAtStr = quotaEndDate.toISOString().split("T")[0];

      // ۲. بروزرسانی اطلاعات کاربر و فعال‌سازی پلن
      await query(
        `UPDATE users 
          SET name = ?, 
              job_id = ?, 
              plan_key = 'free_trial',
              sms_monthly_quota = ?, 
              sms_balance = ?,
              purchased_sms_credit = 0,
              started_at = ?, 
              ended_at = ?, 
              quota_starts_at = ?, 
              quota_ends_at = ?
          WHERE id = ?`,
        [
          name.trim(),
          jobIdNumber,
          MONTHLY_SMS_QUOTA,
          MONTHLY_SMS_QUOTA,
          todayStr,
          endedAtStr,
          todayStr,
          quotaEndsAtStr,
          userId,
        ]
      );

      // ۳. ثبت در تاریخچه خریدها
      await query(
        `INSERT INTO smspurchase 
          (user_id, type, amount_paid, sms_amount, valid_from, valid_until, status)
          VALUES (?, 'trial_quota', 0, ?, ?, ?, 'active')`,
        [userId, MONTHLY_SMS_QUOTA, todayStr, endedAtStr]
      );

      // ۴. افزایش آمار کسب‌وکار
      await query(
        "UPDATE jobs SET businessCount = businessCount + 1 WHERE id = ?",
        [jobIdNumber]
      );

      showWelcomeModal = true;
    } else {
      // بروزرسانی اطلاعات پایه
      await query("UPDATE users SET name = ?, job_id = ? WHERE id = ?", [
        name.trim(),
        jobIdNumber,
        userId,
      ]);

      if (prevJobId !== jobIdNumber) {
        if (prevJobId) {
          await query(
            "UPDATE jobs SET businessCount = businessCount - 1 WHERE id = ? AND businessCount > 0",
            [prevJobId]
          );
        }
        await query(
          "UPDATE jobs SET businessCount = businessCount + 1 WHERE id = ?",
          [jobIdNumber]
        );
      }
    }

    // ۵. آپدیت کردن کوکی برای Middleware
    // این بخش بسیار حیاتی است تا Middleware بلافاصله اجازه ورود به داشبورد را بدهد
    (await cookies()).set("is_registered", "true", {
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      message: "ثبت‌نام با موفقیت تکمیل شد و پلن ۲ ماهه فعال گردید.",
      show_welcome_modal: showWelcomeModal,
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    return NextResponse.json(
      { message: "خطا در پردازش اطلاعات." },
      { status: 500 }
    );
  }
});

export { POST };
