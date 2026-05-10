// src/app/api/admin/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

// GET: دریافت لیست همه اطلاعیه‌ها
export const GET = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const announcements = await query(
      `SELECT sa.*,
       (SELECT COUNT(*) FROM user_announcement_views WHERE announcement_id = sa.id) as view_count_total
       FROM system_announcements sa
       ORDER BY 
         FIELD(sa.priority, 'urgent', 'high', 'normal', 'low'),
         sa.created_at DESC`
    );
    
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت اطلاعیه‌ها" },
      { status: 500 }
    );
  }
});

// POST: ایجاد اطلاعیه جدید
export const POST = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const body = await req.json();
    const {
      title,
      content,
      type = "info",
      priority = "normal",
      target_users = "all",
      is_active = true,
      action_link = null,
      is_dismissible = true,
    } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "عنوان و متن اطلاعیه الزامی است" },
        { status: 400 }
      );
    }
    
    const result: any = await query(
      `INSERT INTO system_announcements 
       (title, content, type, priority, target_users, is_active, action_link, is_dismissible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, type, priority, target_users, is_active ? 1 : 0, action_link, is_dismissible ? 1 : 0]
    );
    
    return NextResponse.json({
      success: true,
      message: "اطلاعیه با موفقیت ایجاد شد",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ایجاد اطلاعیه" },
      { status: 500 }
    );
  }
});

// PUT: ویرایش اطلاعیه
export const PUT = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه اطلاعیه الزامی است" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const {
      title,
      content,
      type,
      priority,
      target_users,
      is_active,
      action_link,
      is_dismissible,
    } = body;
    
    await query(
      `UPDATE system_announcements 
       SET title = ?, content = ?, type = ?, priority = ?, target_users = ?, 
           is_active = ?, action_link = ?, is_dismissible = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, content, type, priority, target_users, is_active ? 1 : 0, action_link, is_dismissible ? 1 : 0, id]
    );
    
    return NextResponse.json({
      success: true,
      message: "اطلاعیه با موفقیت ویرایش شد",
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ویرایش اطلاعیه" },
      { status: 500 }
    );
  }
});

// DELETE: حذف اطلاعیه
export const DELETE = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "شناسه اطلاعیه الزامی است" },
        { status: 400 }
      );
    }
    
    await query("DELETE FROM system_announcements WHERE id = ?", [id]);
    
    return NextResponse.json({
      success: true,
      message: "اطلاعیه با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف اطلاعیه" },
      { status: 500 }
    );
  }
});