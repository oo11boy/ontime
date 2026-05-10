// src/app/api/client/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  
  const cookieStore = await cookies();
  const userType = cookieStore.get("user_type")?.value;
  
  try {
    // تعیین نوع کاربر
    let targetFilter = "all";
    if (userType === "staff") {
      targetFilter = "staff_only";
    } else if (userType === "user") {
      targetFilter = "owners_only";
    }
    
    // دریافت اطلاعیه‌ها با در نظر گرفتن is_dismissible
    const announcements = await query(
      `SELECT 
        sa.id, 
        sa.title, 
        sa.content, 
        sa.type, 
        sa.priority, 
        sa.action_link,
        sa.is_dismissible,
        CASE WHEN uav.id IS NOT NULL THEN TRUE ELSE FALSE END as is_viewed,
        IFNULL(uav.is_dismissed, FALSE) as is_dismissed
      FROM system_announcements sa
      LEFT JOIN user_announcement_views uav 
        ON uav.announcement_id = sa.id AND uav.user_id = ?
      WHERE sa.is_active = 1
        AND (
          sa.target_users = 'all' 
          OR (sa.target_users = 'owners_only' AND ? = 'owners_only')
          OR (sa.target_users = 'staff_only' AND ? = 'staff_only')
        )
        AND (
          -- اگر اطلاعیه قابل بستن است و کاربر آن را نبسته، نمایش بده
          (sa.is_dismissible = 1 AND (uav.is_dismissed = 0 OR uav.is_dismissed IS NULL))
          -- اگر اطلاعیه قابل بستن نیست، همیشه نمایش بده (حتی اگر قبلاً دیده شده)
          OR sa.is_dismissible = 0
        )
      ORDER BY 
        FIELD(sa.priority, 'urgent', 'high', 'normal', 'low'),
        sa.created_at DESC`,
      [userId, targetFilter, targetFilter]
    );
    
    const unviewedCount = announcements.filter((a: any) => !a.is_viewed).length;
    
    return NextResponse.json({
      success: true,
      announcements,
      unviewedCount,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعیه‌ها" },
      { status: 500 }
    );
  }
});

// POST: ثبت اقدام کاربر روی اطلاعیه
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  
  try {
    const { announcementId, action } = await req.json();
    
    if (!announcementId) {
      return NextResponse.json(
        { success: false, message: "شناسه اطلاعیه الزامی است" },
        { status: 400 }
      );
    }
    
    if (action === "view") {
      await query(
        `INSERT IGNORE INTO user_announcement_views (user_id, announcement_id, viewed_at)
         VALUES (?, ?, NOW())`,
        [userId, announcementId]
      );
      
      await query(
        "UPDATE system_announcements SET view_count = view_count + 1 WHERE id = ?",
        [announcementId]
      );
    }
    
    if (action === "dismiss") {
      await query(
        `INSERT INTO user_announcement_views (user_id, announcement_id, is_dismissed, dismissed_at)
         VALUES (?, ?, TRUE, NOW())
         ON DUPLICATE KEY UPDATE is_dismissed = TRUE, dismissed_at = NOW()`,
        [userId, announcementId]
      );
    }
    
    if (action === "click") {
      await query(
        `INSERT INTO user_announcement_views (user_id, announcement_id, clicked_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE clicked_at = NOW()`,
        [userId, announcementId]
      );
      
      await query(
        "UPDATE system_announcements SET click_count = click_count + 1 WHERE id = ?",
        [announcementId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating announcement action:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی" },
      { status: 500 }
    );
  }
});