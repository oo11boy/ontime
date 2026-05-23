// src/app/api/client/customer-link/create/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

function generateSlug(name: string): string {
  return name
    .replace(/[^آ-یa-zA-Z0-9]/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      slug, // اسلاگ دلخواه کاربر
      business_name,
      business_address,
      phone,
      bio,
      logo,
      social_media,
      services,
      working_hours,
      holidays,
    } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "آدرس صفحه اختصاصی الزامی است" },
        { status: 400 }
      );
    }

    // بررسی تکراری نبودن اسلاگ
    const existing = await query(
      "SELECT id FROM customer_links WHERE slug = ? AND is_deleted = 0",
      [slug]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "این آدرس قبلاً توسط شخص دیگری ثبت شده است" },
        { status: 400 }
      );
    }

    const fullUrl = `myapp.ir/c/${slug}`;

    // ذخیره لینک اختصاصی
    const result = await query(
      `INSERT INTO customer_links 
       (user_id, slug, full_url, business_name, business_address, phone, bio, logo, 
        social_media, services, working_hours, holidays, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        userId,
        slug,
        fullUrl,
        business_name || null,
        business_address || null,
        phone || null,
        bio || null,
        logo || null,
        social_media ? JSON.stringify(social_media) : null,
        services ? JSON.stringify(services) : null,
        working_hours ? JSON.stringify(working_hours) : null,
        holidays ? JSON.stringify(holidays) : null,
      ]
    );

    // همچنین اطلاعات پایه کاربر را بروزرسانی کنیم
    await query(
      `UPDATE users 
       SET business_name = ?, business_address = ?, name = COALESCE(?, name)
       WHERE id = ?`,
      [business_name, business_address, business_name, userId]
    );

    return NextResponse.json({
      success: true,
      message: "لینک اختصاصی با موفقیت ساخته شد",
      link: {
        slug,
        fullUrl,
      },
    });
  } catch (error: any) {
    console.error("Error creating customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ساخت لینک اختصاصی" },
      { status: 500 }
    );
  }
});