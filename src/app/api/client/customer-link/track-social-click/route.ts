import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, social_type } = body;

    if (!slug || !social_type) {
      return NextResponse.json(
        { success: false, message: "slug و social_type الزامی است" },
        { status: 400 }
      );
    }

    // پیدا کردن لینک
    const link = await query<any>(
      "SELECT id, user_id FROM customer_links WHERE slug = ? AND is_active = 1 AND is_deleted = 0",
      [slug]
    );

    if (!link || link.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک یافت نشد" },
        { status: 404 }
      );
    }

    const linkId = link[0].id;
    const userId = link[0].user_id;

    // ثبت کلیک
    await query(
      `INSERT INTO social_clicks (link_id, user_id, social_type, clicked_at)
       VALUES (?, ?, ?, NOW())`,
      [linkId, userId, social_type]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking social click:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت کلیک" },
      { status: 500 }
    );
  }
}