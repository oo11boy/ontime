// src/app/api/client/reviews/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

// دریافت لیست نظرات (با فیلتر status)
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all"; // all, pending, approved, rejected

  try {
    let queryStr = `SELECT id, customer_name, rating, comment, status, likes, created_at 
                     FROM reviews WHERE user_id = ?`;
    const params: any[] = [userId];

    if (status !== "all") {
      queryStr += " AND status = ?";
      params.push(status);
    }

    queryStr += " ORDER BY created_at DESC";

    const reviews = await query<any>(queryStr, params);

    return NextResponse.json({
      success: true,
      data: reviews || [],
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت نظرات" },
      { status: 500 }
    );
  }
});

// تایید نظر
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const body = await req.json();
  const { reviewId, action } = body; // action: 'approve' or 'reject'

  if (!reviewId || !action) {
    return NextResponse.json(
      { success: false, message: "اطلاعات کامل نیست" },
      { status: 400 }
    );
  }

  try {
    const newStatus = action === "approve" ? "approved" : "rejected";

    await query(
      `UPDATE reviews SET status = ? WHERE id = ? AND user_id = ?`,
      [newStatus, reviewId, userId]
    );

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "نظر تایید شد" : "نظر رد شد",
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی نظر" },
      { status: 500 }
    );
  }
});

// حذف نظر
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get("id");

  if (!reviewId) {
    return NextResponse.json(
      { success: false, message: "شناسه نظر یافت نشد" },
      { status: 400 }
    );
  }

  try {
    await query(`DELETE FROM reviews WHERE id = ? AND user_id = ?`, [reviewId, userId]);

    return NextResponse.json({
      success: true,
      message: "نظر با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف نظر" },
      { status: 500 }
    );
  }
});