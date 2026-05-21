// src/app/api/client/video-trainings/route.ts
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
  view_count: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    let sql = `SELECT id, title, subtitle, video_url, video_id, cover_image, duration, category, view_count, created_at
               FROM video_trainings 
               WHERE is_active = 1
               ORDER BY order_index ASC, created_at DESC`;
    
    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }
    
    const trainings = await query<TrainingVideo>(sql);
    
    if (!limit && trainings.length > 0) {
      for (const training of trainings) {
        await query(`UPDATE video_trainings SET view_count = view_count + 1 WHERE id = ?`, [training.id]);
      }
    }
    
    return NextResponse.json({ success: true, trainings });
  } catch (error) {
    console.error('Error fetching video trainings:', error);
    return NextResponse.json({ success: false, trainings: [] });
  }
}