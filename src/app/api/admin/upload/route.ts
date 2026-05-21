// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'فایلی ارسال نشده' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.name);
    const filename = `cover_${timestamp}_${randomStr}${ext}`;
    
    // ذخیره در پوشه public/uploads (دسترسی آسان)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    
    const imageUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url: imageUrl });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'خطا در آپلود' }, { status: 500 });
  }
}