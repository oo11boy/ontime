import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 ساعت

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const id = searchParams.get("id");
    
    // اگر ID مشخص شده باشد، یک ویدیو را برگردان
    if (id) {
      const trainings = await query(
        `SELECT id, title, subtitle, video_url, cover_image, duration, category, view_count, created_at
         FROM video_trainings 
         WHERE id = ? AND is_active = 1`,
        [parseInt(id)]
      );
      
      if (trainings.length === 0) {
        return NextResponse.json(
          { success: false, message: "آموزش یافت نشد" },
          { status: 404 }
        );
      }
      
      // افزایش بازدید
      await query(
        `UPDATE video_trainings SET view_count = view_count + 1 WHERE id = ?`,
        [parseInt(id)]
      );
      
      return NextResponse.json({
        success: true,
        training: trainings[0],
      });
    }
    
    // لیست همه ویدیوها
    let sql = `SELECT id, title, subtitle, video_url, cover_image, duration, category, view_count, created_at
               FROM video_trainings 
               WHERE is_active = 1
               ORDER BY order_index ASC, created_at DESC`;
    
    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }
    
    const trainings = await query(sql);
    
    // افزایش بازدید کل صفحه (اختیاری - فقط یکبار در هر بازدید)
    // می‌توانید این قسمت را حذف کنید یا در جای دیگر پیاده‌سازی کنید
    
    return NextResponse.json({
      success: true,
      trainings,
      total: trainings.length,
    });
    
  } catch (error) {
    console.error("Error fetching video trainings:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت آموزش‌ها", trainings: [] },
      { status: 500 }
    );
  }
}