// src/app/api/client/customer-link/check-slug/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ available: false, message: "slug required" }, { status: 400 });
  }

  if (slug.length < 3) {
    return NextResponse.json({ available: false, message: "slug too short" }, { status: 400 });
  }

  try {
    const existing = await query(
      "SELECT id FROM customer_links WHERE slug = ? AND is_deleted = 0 AND user_id != ?",
      [slug, userId]
    );

    const isAvailable = !existing || existing.length === 0;

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable ? "این آدرس قابل ثبت است" : "این آدرس قبلاً ثبت شده است",
    });
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { available: false, message: "خطا در بررسی آدرس" },
      { status: 500 }
    );
  }
});