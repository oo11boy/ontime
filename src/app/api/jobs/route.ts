// src/app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * @method GET
 * دریافت لیست مشاغل (برای صفحه ثبت نام)
 */
export async function GET() {
    try {
        const jobs = await query<{ id: number, persian_name: string, english_name: string }>('SELECT id, persian_name, english_name FROM jobs ORDER BY id');
        
        return NextResponse.json({ 
            message: 'Jobs list fetched successfully', 
            jobs 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch jobs' }, { status: 500 });
    }
}