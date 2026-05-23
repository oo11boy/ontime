// src/app/api/customer-link/[slug]/feature-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }  // تغییر: params از نوع Promise
) {
  try {
    // ابتدا await کنید
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }
    
    const connection = await dbPool.getConnection();
    
    const [links]: any = await connection.execute(
      `SELECT 
        id, 
        booking_feature_enabled,
        booking_feature_expiry,
        DATE(NOW()) as today
      FROM customer_links 
      WHERE slug = ? AND is_active = 1 AND is_deleted = 0
      LIMIT 1`,
      [slug]
    );
    
    connection.release();
    
    if (!links || links.length === 0) {
      return NextResponse.json(
        { success: false, message: "Link not found" },
        { status: 404 }
      );
    }
    
    const link = links[0];
    let isBookingEnabled = false;
    let expiryDate = null;
    let daysRemaining = 0;
    
    // بررسی فعال بودن و عدم انقضا
    if (link.booking_feature_enabled === 1 && link.booking_feature_expiry) {
      const expiry = new Date(link.booking_feature_expiry);
      const today = new Date();
      
      if (expiry >= today) {
        isBookingEnabled = true;
        expiryDate = link.booking_feature_expiry;
        
        // محاسبه روزهای باقی‌مانده
        const diffTime = expiry.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        isBookingEnabled,
        expiryDate,
        daysRemaining,
      }
    });
    
  } catch (error) {
    console.error("Error checking booking feature status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}