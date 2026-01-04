import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * دریافت لیست قالب‌های پیامکی کاربر به همراه ستون‌های هوشمند sub_type و message_count
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const sql = `
      SELECT 
        id, 
        name, 
        content,
        type,
        sub_type,
        payamresan_id,
        message_count
      FROM smstemplates 
      WHERE user_id = ? OR user_id IS NULL 
      ORDER BY id ASC
    `;
    
    const templates = await query<any>(sql, [userId]);
    
    return NextResponse.json({ 
      success: true,
      message: 'قالب‌های پیامک با موفقیت دریافت شدند', 
      templates 
    });

  } catch (error) {
    console.error("Failed to fetch SMS templates:", error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت قالب‌ها' }, { status: 500 });
  }
});

/**
 * @method POST
 * ایجاد قالب جدید با پشتیبانی از هدف زمانی و تعداد پیامک دستی
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { 
      name, 
      content, 
      type, 
      sub_type, 
      payamresan_id, 
      message_count = 1 
    } = await req.json();
    
    if (!name || !payamresan_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'نام الگو و کد پترن الزامی هستند' 
      }, { status: 400 });
    }

    const sql = `
      INSERT INTO smstemplates 
      (user_id, name, content, type, sub_type, payamresan_id, message_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result: any = await query(sql, [
      userId, 
      name, 
      content || '', 
      type || 'generic', 
      sub_type || 'none', 
      payamresan_id,
      message_count
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'الگو با موفقیت ایجاد شد',
      id: result.insertId 
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در ایجاد الگو' }, { status: 500 });
  }
});

/**
 * @method PUT
 * ویرایش قالب با به‌روزرسانی تمام فیلدها از جمله message_count
 */
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { 
      id, 
      name, 
      content, 
      type, 
      sub_type, 
      payamresan_id, 
      message_count = 1 
    } = await req.json();
    
    if (!id || !name || !payamresan_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'آیدی، نام الگو و کد پترن الزامی هستند' 
      }, { status: 400 });
    }

    const sql = `
      UPDATE smstemplates 
      SET 
        name = ?, 
        content = ?, 
        type = ?, 
        sub_type = ?, 
        payamresan_id = ?, 
        message_count = ?
      WHERE id = ? AND (user_id = ? OR user_id IS NULL)
    `;
    
    const result: any = await query(sql, [
      name, 
      content || '', 
      type || 'generic', 
      sub_type || 'none', 
      payamresan_id,
      message_count,
      id, 
      userId
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'الگو یافت نشد یا دسترسی ندارید' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'الگو با موفقیت به‌روزرسانی شد' 
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در به‌روزرسانی الگو' }, { status: 500 });
  }
});

/**
 * @method DELETE
 * حذف قالب اختصاصی کاربر
 */
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'آیدی الگو الزامی است' 
      }, { status: 400 });
    }

    const sql = `DELETE FROM smstemplates WHERE id = ? AND user_id = ?`;
    const result: any = await query(sql, [id, userId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'الگو یافت نشد یا دسترسی ندارید' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'الگو با موفقیت حذف شد' 
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در حذف الگو' }, { status: 500 });
  }
});