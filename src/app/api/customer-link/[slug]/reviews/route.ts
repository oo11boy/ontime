// src/app/api/customer-link/[slug]/reviews/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const link = await query<any>(
      "SELECT id, user_id FROM customer_links WHERE slug = ? AND is_active = 1 AND is_deleted = 0",
      [slug]
    );

    if (!link || link.length === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    const userId = link[0].user_id;

    const reviews = await query<any>(
      `SELECT id, customer_name, rating, comment, created_at, likes
       FROM reviews 
       WHERE user_id = ? AND status = 'approved'
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: reviews || [],
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}