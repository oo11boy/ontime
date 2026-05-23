// src/app/api/customer-link/[slug]/reviews/submit/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await req.json();
    const { customer_name, rating, comment } = body;

    if (!customer_name || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "لطفاً تمام فیلدها را کامل کنید" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "امتیاز باید بین 1 تا 5 باشد" },
        { status: 400 }
      );
    }

    const link = await query<any>(
      "SELECT id, user_id FROM customer_links WHERE slug = ? AND is_active = 1 AND is_deleted = 0",
      [slug]
    );

    if (!link || link.length === 0) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    const userId = link[0].user_id;

    await query(
      `INSERT INTO reviews 
       (user_id, customer_name, rating, comment, status, likes, created_at)
       VALUES (?, ?, ?, ?, 'pending', 0, NOW())`,
      [userId, customer_name, rating, comment]
    );

    return NextResponse.json({
      success: true,
      message: "نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ثبت نظر" },
      { status: 500 }
    );
  }
}