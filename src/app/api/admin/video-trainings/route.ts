// src/app/api/admin/video-trainings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TrainingVideo {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
  video_id: string;
  cover_image: string;
  duration: string;
  category: string;
  order_index: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /aparat\.com\/v\/([a-zA-Z0-9]+)/,
    /aparat\.com\/video\/([a-zA-Z0-9]+)/,
    /videohash\/([a-zA-Z0-9]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

export async function GET() {
  try {
    const trainings = await query(
      `SELECT id, title, subtitle, video_url, video_id, cover_image, duration, category, order_index, is_active, view_count, created_at
       FROM video_trainings 
       ORDER BY order_index ASC, created_at DESC`
    );
    return NextResponse.json({ success: true, trainings });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت آموزش‌ها' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, video_url, category, order_index, cover_image } = body;

    if (!title || !video_url) {
      return NextResponse.json({ success: false, message: 'عنوان و لینک ویدیو الزامی است' }, { status: 400 });
    }

    const videoId = extractVideoId(video_url);
    if (!videoId) {
      return NextResponse.json({ success: false, message: 'لینک آپارات معتبر نیست' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO video_trainings (title, subtitle, video_url, video_id, category, order_index, cover_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle || '', video_url, videoId, category || 'عمومی', order_index || 0, cover_image || null]
    );

    // بررسی ساختار result (ممکن است آرایه باشد یا آبجکت با insertId)
    let insertedId: number | null = null;
    
    if (Array.isArray(result) && result.length > 0 && (result as any)[0]?.insertId) {
      insertedId = (result as any)[0].insertId;
    } else if ((result as any)?.insertId) {
      insertedId = (result as any).insertId;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'آموزش با موفقیت اضافه شد', 
      id: insertedId 
    });
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json({ success: false, message: 'خطا در ایجاد آموزش' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { title, subtitle, video_url, category, order_index, is_active, cover_image } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'آیدی آموزش الزامی است' }, { status: 400 });
    }

    let videoId = null;
    if (video_url) {
      videoId = extractVideoId(video_url);
    }

    await query(
      `UPDATE video_trainings 
       SET title = ?, subtitle = ?, video_url = ?, video_id = ?, category = ?, order_index = ?, is_active = ?, cover_image = ?
       WHERE id = ?`,
      [title, subtitle || '', video_url || '', videoId, category || 'عمومی', order_index || 0, is_active !== undefined ? is_active : 1, cover_image || null, id]
    );

    return NextResponse.json({ success: true, message: 'آموزش با موفقیت ویرایش شد' });
  } catch (error) {
    console.error('Error updating training:', error);
    return NextResponse.json({ success: false, message: 'خطا در ویرایش آموزش' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'آیدی آموزش الزامی است' }, { status: 400 });
    }

    await query(`DELETE FROM video_trainings WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'آموزش با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف آموزش' }, { status: 500 });
  }
}