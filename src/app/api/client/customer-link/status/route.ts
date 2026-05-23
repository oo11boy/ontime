// src/app/api/client/customer-link/status/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// دریافت وضعیت لینک اختصاصی کاربر
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // بررسی وجود لینک اختصاصی در دیتابیس
    const result = await query<any>(
      `SELECT id, slug, full_url, created_at, total_visits, is_active 
       FROM customer_links 
       WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );

    const hasLink = result && result.length > 0;
    const link = hasLink ? result[0] : null;

    return NextResponse.json({
      success: true,
      hasLink,
      link: link ? {
        id: link.id,
        slug: link.slug,
        fullUrl: link.full_url,
        createdAt: link.created_at,
        totalVisits: link.total_visits || 0,
        isActive: link.is_active === 1,
      } : null,
    });
  } catch (error) {
    console.error("Error checking customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بررسی وضعیت لینک" },
      { status: 500 }
    );
  }
});