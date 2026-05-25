// src/app/api/sms/deduct/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { deductSms, checkSmsBalance, getSmsBalanceDetails } from "@/lib/sms-server";

export async function POST(req: NextRequest) {
  try {
    // بررسی هدر داخلی برای امنیت
    const internalKey = req.headers.get("x-internal-api");
    if (internalKey !== "true" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "دسترسی غیرمجاز" },
        { status: 401 }
      );
    }
    
    const { user_id, amount, reason, booking_id, staff_id } = await req.json();
    
    if (!user_id || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }
    
    // بررسی موجودی کافی
    const balanceCheck = await checkSmsBalance(user_id, amount, staff_id || null);
    
    if (!balanceCheck.hasEnough) {
      return NextResponse.json(
        { 
          success: false, 
          message: balanceCheck.message || "موجودی پیامک کافی نیست" 
        },
        { status: 402 }
      );
    }
    
    // کسر اعتبار با استفاده از تابع موجود
    try {
      await deductSms(user_id, amount, staff_id || null);
    } catch (deductError: any) {
      return NextResponse.json(
        { 
          success: false, 
          message: deductError.message || "خطا در کسر اعتبار" 
        },
        { status: 500 }
      );
    }
    
    // ثبت در لاگ انتقال اعتبار
    await query(
      `INSERT INTO credit_transfer_log 
       (from_user_id, to_user_id, amount, reason, related_staff_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_id, user_id, amount, reason || "new_booking_deduction", staff_id || null]
    );
    
    // دریافت موجودی جدید برای گزارش
    const newBalance = await getSmsBalanceDetails(user_id, staff_id || null);
    
    return NextResponse.json({
      success: true,
      message: `${amount} واحد با موفقیت کسر شد`,
      deductedAmount: amount,
      remainingBalance: newBalance.total_balance,
      remainingPlanBalance: newBalance.plan_balance,
      remainingPurchasedBalance: newBalance.purchased_balance,
    });
  } catch (error) {
    console.error("Error in deduct API:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}

// متد GET برای بررسی موجودی (اختیاری)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const staff_id = searchParams.get("staff_id");
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "user_id الزامی است" },
        { status: 400 }
      );
    }
    
    const balance = await getSmsBalanceDetails(
      parseInt(user_id), 
      staff_id ? parseInt(staff_id) : null
    );
    
    return NextResponse.json({
      success: true,
      balance: balance,
    });
  } catch (error) {
    console.error("Error in balance check API:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}