// File Path: src\app\api\admin\jobs\route.ts

// app/api/jobs/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth'; // وارد کردن گارد جدید
import { NextRequest } from 'next/server';

interface DbJob {
    id: number;
    english_name: string;
    persian_name: string;
    businessCount: number;
}

const formatJob = (job: DbJob) => ({
    id: job.id,
    english_name: job.english_name,
    persian_name: job.persian_name,
    businessCount: job.businessCount,
});

// ------------------------------------
// GET: فقط نیاز به احراز هویت (نه لزوماً super_admin).
// ------------------------------------
export async function GET() {
    // این GET می‌تواند عمومی باشد یا فقط برای ادمین‌ها. اگر فقط برای ادمین‌ها است:
    const adminProtectedGET = withAdminAuth(async () => {
        try {
            const jobs = await query<DbJob>(
                `SELECT id, english_name, persian_name, businessCount 
                 FROM jobs 
                 ORDER BY id ASC`
            );

            const formatted = jobs.map(formatJob);

            return NextResponse.json({
                message: 'Jobs list fetched successfully',
                jobs: formatted,
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return NextResponse.json({ message: 'Failed to fetch jobs' }, { status: 500 });
        }
    }, ['super_admin', 'editor', 'viewer']); // همه ادمین‌ها می‌توانند لیست را ببینند
    
    return adminProtectedGET(new NextRequest('http://dummy')); // فراخوانی گارد
}


// ------------------------------------
// POST, PUT, DELETE: عملیات‌های حساس، نیاز به 'super_admin' یا 'editor' دارند.
// ------------------------------------

const jobAdminHandler = withAdminAuth(async (request, context) => {
    // POST: ایجاد
    if (request.method === 'POST') {
        const { english_name, persian_name } = await request.json();

        if (!english_name || !persian_name) {
            return NextResponse.json(
                { message: 'english_name and persian_name are required' },
                { status: 400 }
            );
        }

        // یکتا بودن english_name
        const exists = await query(`SELECT id FROM jobs WHERE english_name = ?`, [english_name]);
        if (exists.length > 0) {
            return NextResponse.json(
                { message: 'english_name already exists' },
                { status: 409 }
            );
        }

        const result: any = await query(
            `INSERT INTO jobs (english_name, persian_name, businessCount) VALUES (?, ?, 0)`,
            [english_name, persian_name]
        );

        const newJob = {
            id: result.insertId,
            english_name,
            persian_name,
            businessCount: 0,
        };

        return NextResponse.json(
            { message: 'Job created successfully', job: newJob },
            { status: 201 }
        );
    } 
    
    // PUT: ویرایش
    else if (request.method === 'PUT') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

        const { english_name, persian_name } = await request.json();

        if (!english_name || !persian_name) {
            return NextResponse.json(
                { message: 'english_name and persian_name are required' },
                { status: 400 }
            );
        }

        // چک یکتا بودن english_name (به جز خودش)
        const exists = await query(
            `SELECT id FROM jobs WHERE english_name = ? AND id != ?`,
            [english_name, id]
        );
        if (exists.length > 0) {
            return NextResponse.json(
                { message: 'english_name already exists' },
                { status: 409 }
            );
        }

        const result: any = await query(
            `UPDATE jobs SET english_name = ?, persian_name = ? WHERE id = ?`,
            [english_name, persian_name, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        const updatedJob = await query<DbJob>(`SELECT id, english_name, persian_name, businessCount FROM jobs WHERE id = ?`, [id]);


        return NextResponse.json({
            message: 'Job updated successfully',
            job: formatJob(updatedJob[0]),
        });
    } 
    
    // DELETE: حذف
    else if (request.method === 'DELETE') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

        const hasUsers = await query(`SELECT id FROM users WHERE job_id = ? LIMIT 1`, [id]);
        if (hasUsers.length > 0) {
            return NextResponse.json(
                { message: 'این شغل دارای کسب‌وکار فعال است و قابل حذف نیست' },
                { status: 409 }
            );
        }

        const result: any = await query(`DELETE FROM jobs WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Job deleted successfully' });
    }
    
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });

// اجازه به نقش‌های super_admin و editor برای تغییرات
}, ['super_admin', 'editor']); 


// توابع GET، POST، PUT و DELETE را به هندلر محافظت شده پاس می‌دهیم.
// توجه: Next.js تمام متدهای POST، PUT، DELETE را از این تابع مشترک اجرا خواهد کرد.
export async function POST(request: NextRequest) { return jobAdminHandler(request); }
export async function PUT(request: NextRequest) { return jobAdminHandler(request); }
export async function DELETE(request: NextRequest) { return jobAdminHandler(request); }