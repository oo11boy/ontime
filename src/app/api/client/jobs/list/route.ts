// src/app/api/client/jobs/list/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await query<{ id: number; persian_name: string; english_name: string }>(
      `SELECT id, persian_name, english_name FROM jobs ORDER BY id ASC`
    );

    return NextResponse.json({
      jobs: jobs.map(job => ({
        id: job.id,
        persian_name: job.persian_name,  // ← نام فارسی
        english_name: job.english_name   // ← نام انگلیسی
      }))
    });
  } catch (error) {
    console.error('Error fetching jobs list:', error);
    return NextResponse.json({ jobs: [] });
  }
}