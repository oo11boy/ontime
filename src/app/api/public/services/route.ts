// src/app/api/public/services/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // دریافت همه خدمات منحصر به فرد از همه کسب و کارها
    const services = await query<any>(
      `SELECT DISTINCT 
        JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name
      FROM customer_links cl
      CROSS JOIN (
        SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
        UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
        UNION SELECT 8 UNION SELECT 9
      ) numbers
      WHERE cl.is_active = 1 
        AND cl.is_deleted = 0
        AND cl.services IS NOT NULL
        AND JSON_LENGTH(cl.services) > n
        AND JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) IS NOT NULL
      GROUP BY service_name
      ORDER BY COUNT(*) DESC
      LIMIT 20`
    );
    
    return NextResponse.json({
      success: true,
      data: services.map((s: any) => ({
        name: s.service_name,
        slug: s.service_name.replace(/[^آ-یa-zA-Z0-9]/g, "-").toLowerCase()
      }))
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت خدمات" },
      { status: 500 }
    );
  }
}