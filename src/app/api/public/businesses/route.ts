// src/app/api/public/businesses/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const jobId = searchParams.get("jobId");
    const city = searchParams.get("city");
    const province = searchParams.get("province");
    const sortBy = searchParams.get("sortBy") || "visits"; // visits, rating, newest
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // ============================================
    // دریافت یک کسب و کار با اسلاگ
    // ============================================
    if (slug) {
      const businesses = await query<any>(
        `SELECT 
          cl.business_name,
          cl.province,
          cl.city,
          cl.business_address,
          cl.avatar_image,
          cl.cover_image,
          cl.services,
          cl.bio,
          cl.slug,
          cl.full_url,
          cl.total_visits,
          j.id as job_id,
          j.persian_name as job_name,
          j.english_name as job_slug,
          (SELECT COUNT(*) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as review_count,
          (SELECT AVG(rating) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as avg_rating
        FROM customer_links cl
        LEFT JOIN users u ON cl.user_id = u.id
        LEFT JOIN jobs j ON u.job_id = j.id
        WHERE cl.slug = ? 
          AND cl.is_active = 1 
          AND cl.is_deleted = 0`,
        [slug]
      );
      
      if (!businesses?.length) {
        return NextResponse.json({ success: false, message: "کسب و کار یافت نشد" }, { status: 404 });
      }
      
      const business = businesses[0];
      
      // افزایش بازدید (غیرهمزمان)
      query(`UPDATE customer_links SET total_visits = total_visits + 1 WHERE slug = ?`, [slug]).catch(() => {});
      
      return NextResponse.json({
        success: true,
        data: {
          business_name: business.business_name,
          province: business.province,
          city: business.city,
          address: business.business_address,
          avatar: business.avatar_image,
          cover: business.cover_image,
          services: business.services ? JSON.parse(business.services) : [],
          bio: business.bio,
          page_url: business.full_url || `/c/${business.slug}`,
          total_visits: business.total_visits || 0,
          job: business.job_id ? {
            id: business.job_id,
            name: business.job_name,
            slug: business.job_slug
          } : null,
          stats: {
            review_count: parseInt(business.review_count) || 0,
            avg_rating: parseFloat(business.avg_rating) || 0
          }
        }
      });
    }
    
    // ============================================
    // لیست کسب و کارها با فیلتر
    // ============================================
    let conditions = [
      "cl.is_active = 1",
      "cl.is_deleted = 0"
    ];
    const params: any[] = [];
    
    if (jobId) {
      conditions.push("u.job_id = ?");
      params.push(parseInt(jobId));
    }
    
    if (city) {
      conditions.push("cl.city = ?");
      params.push(city);
    }
    
    if (province) {
      conditions.push("cl.province = ?");
      params.push(province);
    }
    
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    
    // مرتب‌سازی
    const orderBy = {
      visits: "cl.total_visits DESC",
      rating: "avg_rating DESC",
      newest: "cl.created_at DESC"
    }[sortBy] || "cl.total_visits DESC";
    
    // کوئری اصلی
    const businesses = await query<any>(
      `SELECT 
        cl.business_name,
        cl.province,
        cl.city,
        cl.business_address,
        cl.avatar_image,
        cl.cover_image,
        cl.services,
        cl.bio,
        cl.slug,
        cl.total_visits,
        j.id as job_id,
        j.persian_name as job_name,
        j.english_name as job_slug,
        (SELECT COUNT(*) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as review_count,
        (SELECT AVG(rating) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as avg_rating
      FROM customer_links cl
      LEFT JOIN users u ON cl.user_id = u.id
      LEFT JOIN jobs j ON u.job_id = j.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    // شمارش کل
    const countResult = await query<any>(
      `SELECT COUNT(*) as total FROM customer_links cl
      LEFT JOIN users u ON cl.user_id = u.id
      ${whereClause}`,
      params
    );
    
    const total = countResult[0]?.total || 0;
    
    return NextResponse.json({
      success: true,
      data: businesses.map((business: any) => ({
        business_name: business.business_name,
        province: business.province,
        city: business.city,
        address: business.business_address,
        avatar: business.avatar_image,
        cover: business.cover_image,
        services: business.services ? JSON.parse(business.services) : [],
        bio: business.bio,
        slug: business.slug,
        page_url: `/c/${business.slug}`,
        total_visits: business.total_visits || 0,
        job: business.job_id ? {
          id: business.job_id,
          name: business.job_name,
          slug: business.job_slug
        } : null,
        stats: {
          review_count: parseInt(business.review_count) || 0,
          avg_rating: parseFloat(business.avg_rating) || 0
        }
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعات" },
      { status: 500 }
    );
  }
}