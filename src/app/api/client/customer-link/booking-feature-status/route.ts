// src/app/api/client/customer-link/booking-feature-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  
  try {
    const connection = await dbPool.getConnection();
    
    // دریافت لینک اختصاصی کاربر
    const [links]: any = await connection.execute(
      `SELECT 
        id,
        booking_feature_enabled,
        booking_feature_expiry
      FROM customer_links 
      WHERE user_id = ? AND is_deleted = 0 AND is_active = 1
      LIMIT 1`,
      [userId]
    );
    
    if (!links || links.length === 0) {
      connection.release();
      return NextResponse.json({
        success: true,
        isEnabled: false,
        hasLink: false,
        expiryDate: null,
        daysRemaining: 0,
        message: "لینک اختصاصی ساخته نشده است"
      });
    }
    
    const link = links[0];
    let isEnabled = link.booking_feature_enabled === 1;
    const expiryDate = link.booking_feature_expiry;
    let needsUpdate = false;
    
    // بررسی تاریخ انقضا
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expiryDate && isEnabled) {
      const expiry = new Date(expiryDate);
      expiry.setHours(0, 0, 0, 0);
      
      // اگر تاریخ انقضا گذشته باشد
      if (expiry < today) {
        isEnabled = false;
        needsUpdate = true;
        console.log(`[EXPIRY] Plan expired for user ${userId}. Expiry date: ${expiryDate}`);
      }
    }
    
    // آپدیت خودکار دیتابیس اگر تاریخ انقضا گذشته باشد
    if (needsUpdate) {
      await connection.execute(
        `UPDATE customer_links 
         SET booking_feature_enabled = 0, 
             updated_at = NOW() 
         WHERE id = ?`,
        [link.id]
      );
      console.log(`[EXPIRY] Updated customer_links: set booking_feature_enabled = 0 for id ${link.id}`);
    }
    
    connection.release();
    
    // محاسبه روزهای باقیمانده
    let daysRemaining = 0;
    if (isEnabled && expiryDate) {
      const expiry = new Date(expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }
    
    console.log("Booking Feature Status:", {
      userId,
      isEnabled,
      expiryDate,
      daysRemaining,
      needsUpdate
    });
    
    return NextResponse.json({
      success: true,
      isEnabled: isEnabled,
      hasLink: true,
      expiryDate: expiryDate,
      daysRemaining: daysRemaining,
      message: isEnabled ? "دسترسی فعال است" : "دسترسی فعال نیست"
    });
    
  } catch (error) {
    console.error("Error checking booking feature status:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بررسی دسترسی" },
      { status: 500 }
    );
  }
});