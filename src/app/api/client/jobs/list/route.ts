// app/api/jobs/list/route.ts  (یا /api/jobs?simple=true)

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await query<{ id: number; persian_name: string }>(
      `SELECT id, persian_name FROM jobs ORDER BY id ASC`
    );

    return NextResponse.json({
      jobs: jobs.map(job => ({
        id: job.id,
        name: job.persian_name
      }))
    });
  } catch (error) {
    console.error('Error fetching jobs list:', error);
    return NextResponse.json({ jobs: [] });
  }
}