// src/app/api/public/filters/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // دریافت دسته‌های شغلی با تعداد کسب و کار
    const jobs = await query<any>(
      `SELECT 
        j.id,
        j.persian_name as name,
        j.english_name as slug,
        COUNT(cl.id) as business_count
      FROM jobs j
      LEFT JOIN users u ON u.job_id = j.id
      LEFT JOIN customer_links cl ON cl.user_id = u.id 
        AND cl.is_active = 1 
        AND cl.is_deleted = 0
      GROUP BY j.id
      ORDER BY business_count DESC, j.persian_name ASC`
    );
    
    // دریافت شهرهای دارای کسب و کار
    const cities = await query<any>(
      `SELECT 
        city,
        province,
        COUNT(*) as business_count
      FROM customer_links
      WHERE is_active = 1 AND is_deleted = 0 AND city IS NOT NULL
      GROUP BY city, province
      ORDER BY business_count DESC
      LIMIT 20`
    );
    
    // دریافت استان‌های دارای کسب و کار
    const provinces = await query<any>(
      `SELECT 
        province,
        COUNT(*) as business_count
      FROM customer_links
      WHERE is_active = 1 AND is_deleted = 0 AND province IS NOT NULL
      GROUP BY province
      ORDER BY business_count DESC`
    );
    
    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((j: any) => ({
          id: j.id,
          name: j.name,
          slug: j.slug,
          business_count: parseInt(j.business_count)
        })),
        cities: cities.map((c: any) => ({
          name: c.city,
          province: c.province,
          business_count: parseInt(c.business_count)
        })),
        provinces: provinces.map((p: any) => ({
          name: p.province,
          business_count: parseInt(p.business_count)
        }))
      }
    });
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت فیلترها" },
      { status: 500 }
    );
  }
}