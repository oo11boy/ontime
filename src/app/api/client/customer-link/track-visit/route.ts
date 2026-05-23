import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from "next/server";

// تابع برای دریافت زمان تهران
const getTehranTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" }));
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, device_type, referrer, time_on_page, session_id, custom_time } = body;

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
    
    // استفاده از زمان دلخواه اگر ارسال شده، در غیر این صورت زمان حال
    let visitTime;
    if (custom_time) {
      visitTime = custom_time;
    } else {
      visitTime = getTehranTime();
    }

    // ثبت بازدید
    await query(
      `INSERT INTO link_visits (link_id, user_id, session_id, device_type, referrer, time_on_page, visited_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [linkId, userId, session_id || null, device_type || "unknown", referrer || null, time_on_page || 0, visitTime]
    );

    // بروزرسانی آمار
    await query(
      `UPDATE customer_links 
       SET total_visits = (SELECT COUNT(*) FROM link_visits WHERE link_id = ?),
           unique_visitors = (SELECT COUNT(DISTINCT session_id) FROM link_visits WHERE link_id = ? AND session_id IS NOT NULL)
       WHERE id = ?`,
      [linkId, linkId, linkId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}