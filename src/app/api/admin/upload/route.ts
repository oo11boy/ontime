// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { withAdminAuth } from '@/lib/auth';

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'فایلی ارسال نشده است' }, { status: 400 });
    }

    // بررسی نوع فایل
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'فرمت فایل پشتیبانی نمی‌شود' }, { status: 400 });
    }

    // بررسی حجم فایل (حداکثر 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'حجم فایل باید کمتر از 2 مگابایت باشد' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ایجاد نام یکتا برای فایل
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const filename = `training_cover_${timestamp}_${randomStr}${ext}`;
    
    // مسیر ذخیره‌سازی
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'trainings');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // آدرس نسبی برای ذخیره در دیتابیس
    const imageUrl = `/uploads/trainings/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      message: 'تصویر با موفقیت آپلود شد'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'خطا در آپلود تصویر' }, { status: 500 });
  }
}, ['super_admin', 'editor']);