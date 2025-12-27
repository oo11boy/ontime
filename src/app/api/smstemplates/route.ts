import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * دریافت لیست قالب‌های پیامکی کاربر به همراه ستون هوشمند sub_type
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
        payamresan_id
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
 * ایجاد قالب جدید با پشتیبانی از هدف زمانی (امروز/فردا)
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { name, content, type, sub_type, payamresan_id } = await req.json();
    
    const sql = `
      INSERT INTO smstemplates (user_id, name, content, type, sub_type, payamresan_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result: any = await query(sql, [
      userId, 
      name, 
      content, 
      type || 'generic', 
      sub_type || 'none', 
      payamresan_id
    ]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'قالب جدید با موفقیت ثبت شد',
      id: result.insertId 
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در ثبت قالب' }, { status: 500 });
  }
});

/**
 * @method PUT
 * ویرایش قالب و به‌روزرسانی وضعیت هوشمند ارسال
 */
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { id, name, content, type, sub_type, payamresan_id } = await req.json();
    
    const sql = `
      UPDATE smstemplates 
      SET name = ?, content = ?, type = ?, sub_type = ?, payamresan_id = ?
      WHERE id = ? AND (user_id = ? OR user_id IS NULL)
    `;
    
    await query(sql, [
      name, 
      content, 
      type, 
      sub_type || 'none', 
      payamresan_id, 
      id, 
      userId
    ]);
    
    return NextResponse.json({ success: true, message: 'قالب با موفقیت بروزرسانی شد' });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در ویرایش قالب' }, { status: 500 });
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

    if (!id) return NextResponse.json({ success: false, message: 'آیدی الزامی است' }, { status: 400 });

    const sql = `DELETE FROM smstemplates WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
    
    return NextResponse.json({ success: true, message: 'قالب حذف شد' });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, message: 'خطا در حذف قالب' }, { status: 500 });
  }
});