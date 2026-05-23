// src/app/api/client/customer-link/track-visit/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, device_type, referrer, time_on_page } = body;

    if (!slug) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // پیدا کردن لینک
    const link = await query<any>(
      "SELECT id, user_id FROM customer_links WHERE slug = ? AND is_active = 1 AND is_deleted = 0",
      [slug]
    );

    if (!link || link.length === 0) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const linkId = link[0].id;
    const userId = link[0].user_id;

    // ثبت بازدید
    await query(
      `INSERT INTO link_visits (link_id, user_id, device_type, referrer, time_on_page, visited_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [linkId, userId, device_type || "unknown", referrer || null, time_on_page || 0]
    );

    // بروزرسانی آمار در جدول customer_links
    await query(
      `UPDATE customer_links 
       SET total_visits = total_visits + 1,
           unique_visitors = (SELECT COUNT(DISTINCT session_id) FROM link_visits WHERE link_id = ?)
       WHERE id = ?`,
      [linkId, linkId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}