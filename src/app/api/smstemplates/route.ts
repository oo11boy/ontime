// File Path: src/app/api/smstemplates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * دریافت لیست قالب‌های پیامکی شامل کد پترن و نوع قالب
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    // اضافه شدن فیلدهای type و payamresan_id برای کارکرد صحیح سیستم داینامیک
    const sql = `
      SELECT 
        id, 
        title, 
        content,
        type,
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
 * ایجاد قالب جدید توسط کاربر
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { title, content, type, payamresan_id } = await req.json();
    
    const sql = `
      INSERT INTO smstemplates (user_id, title, content, type, payamresan_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const result: any = await query(sql, [userId, title, content, type, payamresan_id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'قالب جدید با موفقیت ثبت شد',
      id: result.insertId 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در ثبت قالب' }, { status: 500 });
  }
});

/**
 * @method PUT
 * ویرایش قالب موجود
 */
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { id, title, content, type, payamresan_id } = await req.json();
    
    const sql = `
      UPDATE smstemplates 
      SET title = ?, content = ?, type = ?, payamresan_id = ?
      WHERE id = ? AND (user_id = ? OR user_id IS NULL)
    `;
    
    await query(sql, [title, content, type, payamresan_id, id, userId]);
    
    return NextResponse.json({ success: true, message: 'قالب با موفقیت بروزرسانی شد' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در ویرایش قالب' }, { status: 500 });
  }
});

/**
 * @method DELETE
 * حذف قالب
 */
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const sql = `DELETE FROM smstemplates WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
    
    return NextResponse.json({ success: true, message: 'قالب حذف شد' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در حذف قالب' }, { status: 500 });
  }
});