import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    const connection = await dbPool.getConnection();
    
    // دریافت اطلاعات لینک و وضعیت اشتراک کاربر
    const [links]: any = await connection.execute(
      `SELECT 
        cl.user_id,
        u.ended_at,
        u.plan_key
      FROM customer_links cl
      JOIN users u ON cl.user_id = u.id
      WHERE cl.slug = ? AND cl.is_deleted = 0
      LIMIT 1`,
      [slug]
    );
    
    connection.release();
    
    if (!links || links.length === 0) {
      return NextResponse.json({ isActive: false, error: "لینک یافت نشد" }, { status: 404 });
    }
    
    const link = links[0];
    const now = new Date();
    let isActive = false;
    
    // بررسی فعال بودن اشتراک
    if (link.ended_at && new Date(link.ended_at) > now) {
      isActive = true;
    }
    
    // بررسی پلن‌های ویژه (غیر از free و free_trial که نباید نوبت‌دهی داشته باشند)
    if (link.plan_key && link.plan_key !== "free" && link.plan_key !== "free_trial" && link.plan_key !== "expired") {
      if (!link.ended_at) {
        isActive = true;
      }
    }
    
    return NextResponse.json({ 
      isActive,
      endedAt: link.ended_at,
      planKey: link.plan_key
    });
    
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json({ isActive: false, error: "خطای سرور" }, { status: 500 });
  }
}