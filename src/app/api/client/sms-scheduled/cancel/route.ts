// src/app/api/client/sms-scheduled/cancel/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export const POST = withAuth(async (req: Request, context: any) => {
  const { userId } = context;
  
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  const staffId = cookieStore.get("staff_id")?.value;

  try {
    const { smsLogId } = await req.json();

    if (!smsLogId) {
      return NextResponse.json(
        { success: false, message: "شناسه پیامک الزامی است" },
        { status: 400 }
      );
    }

    const smsLog = await query<any>(
      `SELECT sl.*, b.staff_id as booking_staff_id
       FROM smslog sl
       LEFT JOIN booking b ON sl.booking_id = b.id
       WHERE sl.id = ? AND sl.user_id = ? AND sl.status = 'pending'`,
      [smsLogId, userId]
    );

    if (!smsLog || smsLog.length === 0) {
      return NextResponse.json(
        { success: false, message: "پیامک یافت نشد یا در وضعیت قابل لغو نیست" },
        { status: 404 }
      );
    }

    const sms = smsLog[0];

    if (userType === "staff" && staffId) {
      const staff = await query<any>(
        "SELECT calendar_type FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
        [parseInt(staffId), userId]
      );
      const calendarType = staff?.[0]?.calendar_type;

      if (calendarType === "independent") {
        if (sms.booking_staff_id !== parseInt(staffId)) {
          return NextResponse.json(
            { success: false, message: "شما مجوز لغو این پیامک را ندارید" },
            { status: 403 }
          );
        }
      }
    }

    const cost = sms.cost;
    
    if (sms.staff_id) {
      await query(
        `UPDATE staffs 
         SET sms_balance = sms_balance + ?, 
             sms_used = sms_used - ?
         WHERE id = ? AND owner_user_id = ?`,
        [cost, cost, sms.staff_id, userId]
      );
    } else {
      let remainingRefund = cost;
      
      const recentPackages = await query<any>(
        `SELECT id, remaining_sms FROM smspurchase 
         WHERE user_id = ? AND type = 'one_time_sms' AND status = 'active'
         ORDER BY created_at DESC`,
        [userId]
      );
      
      for (const pkg of recentPackages) {
        if (remainingRefund <= 0) break;
        await query(
          `UPDATE smspurchase SET remaining_sms = remaining_sms + ? WHERE id = ?`,
          [remainingRefund, pkg.id]
        );
        remainingRefund = 0;
      }
      
      if (remainingRefund > 0) {
        await query(
          `UPDATE users SET sms_balance = sms_balance + ? WHERE id = ?`,
          [remainingRefund, userId]
        );
      }
    }

    await query(
      `UPDATE smslog 
       SET status = 'cancelled', 
           error_message = 'لغو شده توسط کاربر'
       WHERE id = ?`,
      [smsLogId]
    );

    try {
      const { smsQueue } = await import("@/lib/sms-queue");
      const jobs = await smsQueue.getJobs(["waiting", "delayed"]);
      for (const job of jobs) {
        if (job.data.logId === smsLogId) {
          await job.remove();
          console.log(`Job ${job.id} removed from queue for cancelled SMS ${smsLogId}`);
          break;
        }
      }
    } catch (queueError) {
      console.error("Error removing job from queue:", queueError);
    }

    return NextResponse.json({
      success: true,
      message: "پیامک با موفقیت لغو شد",
      refundedCost: cost,
    });
  } catch (error) {
    console.error("Error cancelling scheduled SMS:", error);
    return NextResponse.json(
      { success: false, message: "خطا در لغو پیامک" },
      { status: 500 }
    );
  }
});