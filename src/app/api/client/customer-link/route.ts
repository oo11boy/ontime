// src/app/api/client/customer-link/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

interface CustomerLink {
  id: number;
  slug: string;
  full_url: string;
  business_name: string;
  province: string | null;
  city: string | null;
  business_address: string;
  phone: string;
  bio: string;
  logo: string | null;
  avatar_image: string | null;
  cover_image: string | null;
  social_media: string | null;
  services: string | null;
  work_shifts: string | null;
  off_days: string | null;
  total_visits: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ==================== GET - دریافت لینک اختصاصی ====================
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const result = await query<any>(
      `SELECT id, slug, full_url, business_name, province, city, business_address, phone, bio, logo, avatar_image, cover_image,
              social_media, services, work_shifts, off_days, total_visits, is_active, 
              created_at, updated_at
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
        business_name: link.business_name,
        province: link.province,
        city: link.city,
        business_address: link.business_address,
        phone: link.phone,
        bio: link.bio,
        logo: link.logo,
        avatar_image: link.avatar_image,
        cover_image: link.cover_image,
        social_media: link.social_media ? JSON.parse(link.social_media) : null,
        services: link.services ? JSON.parse(link.services) : [],
        work_shifts: link.work_shifts ? JSON.parse(link.work_shifts) : [],
        off_days: link.off_days ? JSON.parse(link.off_days) : [],
        totalVisits: link.total_visits || 0,
        isActive: link.is_active === 1,
        createdAt: link.created_at,
        updatedAt: link.updated_at,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
});

// ==================== POST - ایجاد لینک اختصاصی جدید ====================
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      slug,
      business_name,
      province,
      city,
      business_address,
      phone,
      bio,
      logo,
      avatar_image,
      cover_image,
      social_media,
      services,
      work_shifts,
      off_days,
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

    // ذخیره لینک اختصاصی با فیلدهای جدید
    await query(
      `INSERT INTO customer_links 
       (user_id, slug, full_url, business_name, province, city, business_address, phone, bio, logo, avatar_image, cover_image,
        social_media, services, work_shifts, off_days, total_visits, is_active, is_deleted, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, NOW())`,
      [
        userId,
        slug,
        fullUrl,
        business_name || null,
        province || null,
        city || null,
        business_address || null,
        phone || null,
        bio || null,
        logo || null,
        avatar_image || null,
        cover_image || null,
        social_media ? JSON.stringify(social_media) : null,
        services ? JSON.stringify(services) : null,
        work_shifts ? JSON.stringify(work_shifts) : null,
        off_days ? JSON.stringify(off_days) : null,
      ]
    );

    // بروزرسانی اطلاعات پایه کاربر
    if (business_name) {
      await query(
        `UPDATE users SET business_name = ?, business_address = ? WHERE id = ?`,
        [business_name, business_address || null, userId]
      );
    }

    // همچنین تنظیمات شیفت و تعطیلات کاربر را آپدیت می‌کنیم
    if (work_shifts || off_days) {
      const userSettings = await query<any>(
        "SELECT work_shifts, off_days FROM users WHERE id = ?",
        [userId]
      );
      
      const currentUser = userSettings && userSettings.length > 0 ? userSettings[0] : null;
      
      await query(
        `UPDATE users 
         SET work_shifts = COALESCE(?, work_shifts),
             off_days = COALESCE(?, off_days)
         WHERE id = ?`,
        [
          work_shifts ? JSON.stringify(work_shifts) : currentUser?.work_shifts,
          off_days ? JSON.stringify(off_days) : currentUser?.off_days,
          userId
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "لینک اختصاصی با موفقیت ساخته شد",
      link: { slug, fullUrl },
    });
  } catch (error: any) {
    console.error("Error creating customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ساخت لینک اختصاصی: " + (error.message || "خطای ناشناخته") },
      { status: 500 }
    );
  }
});

// ==================== PUT - بروزرسانی لینک اختصاصی ====================
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      slug,
      business_name,
      province,
      city,
      business_address,
      phone,
      bio,
      logo,
      avatar_image,
      cover_image,
      social_media,
      services,
      work_shifts,
      off_days,
    } = body;

    // بررسی وجود لینک
    const existingLink = await query<any>(
      "SELECT id, slug FROM customer_links WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );

    if (!existingLink || existingLink.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک اختصاصی یافت نشد" },
        { status: 404 }
      );
    }

    const currentSlug = existingLink[0].slug;

    // بروزرسانی لینک اختصاصی با فیلدهای جدید (اسلاگ قابل تغییر نیست)
    await query(
      `UPDATE customer_links 
       SET business_name = ?, 
           province = ?,
           city = ?,
           business_address = ?, 
           phone = ?, 
           bio = ?, 
           logo = ?,
           avatar_image = ?,
           cover_image = ?,
           social_media = ?, 
           services = ?, 
           work_shifts = ?, 
           off_days = ?,
           updated_at = NOW()
       WHERE user_id = ? AND is_deleted = 0`,
      [
        business_name || null,
        province || null,
        city || null,
        business_address || null,
        phone || null,
        bio || null,
        logo || null,
        avatar_image || null,
        cover_image || null,
        social_media ? JSON.stringify(social_media) : null,
        services ? JSON.stringify(services) : null,
        work_shifts ? JSON.stringify(work_shifts) : null,
        off_days ? JSON.stringify(off_days) : null,
        userId,
      ]
    );

    // بروزرسانی اطلاعات پایه کاربر
    if (business_name) {
      await query(
        `UPDATE users SET business_name = ?, business_address = ? WHERE id = ?`,
        [business_name, business_address || null, userId]
      );
    }

    // بروزرسانی تنظیمات شیفت و تعطیلات کاربر
    if (work_shifts || off_days) {
      await query(
        `UPDATE users 
         SET work_shifts = COALESCE(?, work_shifts),
             off_days = COALESCE(?, off_days)
         WHERE id = ?`,
        [
          work_shifts ? JSON.stringify(work_shifts) : null,
          off_days ? JSON.stringify(off_days) : null,
          userId
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "لینک اختصاصی با موفقیت بروزرسانی شد",
      link: { slug: currentSlug, fullUrl: `myapp.ir/c/${currentSlug}` },
    });
  } catch (error: any) {
    console.error("Error updating customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی لینک اختصاصی" },
      { status: 500 }
    );
  }
});

// ==================== DELETE - حذف لینک اختصاصی ====================
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // حذف منطقی (soft delete)
    await query(
      "UPDATE customer_links SET is_deleted = 1, updated_at = NOW() WHERE user_id = ? AND is_deleted = 0",
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "لینک اختصاصی با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting customer link:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف لینک اختصاصی" },
      { status: 500 }
    );
  }
});