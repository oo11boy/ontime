// src/app/api/customer-link/[slug]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Unwrap params با await
  const { slug } = await params;
  
  console.log("API called with slug:", slug);

  try {
    const link = await query<any>(
      `SELECT id, slug, business_name, business_address, phone, bio, logo,
              social_media, services, work_shifts, off_days, total_visits
       FROM customer_links 
       WHERE slug = ? AND is_active = 1 AND is_deleted = 0`,
      [slug]
    );

    if (!link || link.length === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    const data = link[0];

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