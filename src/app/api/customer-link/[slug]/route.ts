// src/app/api/customer-link/[slug]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  console.log("API called with slug:", slug);

  try {
    const link = await query<any>(
      `SELECT id, slug, business_name, business_address, phone, bio, logo, avatar_image, cover_image,
              social_media, services, work_shifts, off_days, total_visits
       FROM customer_links 
       WHERE slug = ? AND is_active = 1 AND is_deleted = 0`,
      [slug]
    );

    if (!link || link.length === 0) {
      console.log("No link found for slug:", slug);
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    const data = link[0];
    
    console.log("Retrieved data:", {
      slug: data.slug,
      business_name: data.business_name,
      has_logo: !!data.logo,
      has_avatar: !!data.avatar_image,
      has_cover: !!data.cover_image,
      logo_url: data.logo,
      avatar_url: data.avatar_image,
      cover_url: data.cover_image,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        slug: data.slug,
        business_name: data.business_name,
        business_address: data.business_address,
        phone: data.phone,
        bio: data.bio,
        logo: data.logo,
        avatar_image: data.avatar_image,
        cover_image: data.cover_image,
        social_media: data.social_media ? JSON.parse(data.social_media) : {},
        services: data.services ? JSON.parse(data.services) : [],
        work_shifts: data.work_shifts ? JSON.parse(data.work_shifts) : [],
        off_days: data.off_days ? JSON.parse(data.off_days) : [],
        total_visits: data.total_visits || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching customer link:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}