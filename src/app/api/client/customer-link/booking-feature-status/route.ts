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
        booking_feature_expiry,
        CASE 
          WHEN booking_feature_enabled = 1 AND booking_feature_expiry >= CURDATE() 
          THEN 1 
          ELSE 0 
        END as is_active
      FROM customer_links 
      WHERE user_id = ? AND is_deleted = 0
      LIMIT 1`,
      [userId]
    );
    
    connection.release();
    
    if (!links || links.length === 0) {
      // کاربر لینک اختصاصی ندارد -> دسترسی ندارد
      return NextResponse.json({
        success: true,
        isEnabled: false,
        hasLink: false,
        message: "لینک اختصاصی ساخته نشده است"
      });
    }
    
    const link = links[0];
    const isEnabled = link.is_active === 1;
    
    return NextResponse.json({
      success: true,
      isEnabled: isEnabled,
      hasLink: true,
      expiryDate: link.booking_feature_expiry,
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