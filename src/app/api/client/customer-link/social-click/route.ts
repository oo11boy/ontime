import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, social_type, session_id } = body;

    if (!slug || !social_type) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }

    // اعتبارسنجی نوع شبکه اجتماعی - اضافه کردن share
    const validSocialTypes = [
      "instagram", "telegram", "whatsapp", "rubika",
      "eitaa", "bale", "soroush", "share",  // ← اضافه شد
      "copy_link", "native_share"  // ← اضافه شد
    ];

    if (!validSocialTypes.includes(social_type)) {
      return NextResponse.json(
        { success: false, message: "نوع شبکه اجتماعی نامعتبر" },
        { status: 400 }
      );
    }

    // پیدا کردن لینک
    const linkResult = await query<any>(
      `SELECT id, user_id FROM customer_links 
       WHERE slug = ? AND is_active = 1 AND is_deleted = 0 LIMIT 1`,
      [slug]
    );

    if (!linkResult || linkResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک یافت نشد" },
        { status: 404 }
      );
    }

    const linkId = linkResult[0].id;
    const userId = linkResult[0].user_id;

    // ثبت کلیک
    await query(
      `INSERT INTO social_clicks (link_id, user_id, social_type, clicked_at, session_id)
       VALUES (?, ?, ?, NOW(), ?)`,
      [linkId, userId, social_type, session_id || null]
    );

    return NextResponse.json({ 
      success: true,
      message: "کلیک ثبت شد" 
    });

  } catch (error) {
    console.error("Error tracking social click:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت کلیک" },
      { status: 500 }
    );
  }
}