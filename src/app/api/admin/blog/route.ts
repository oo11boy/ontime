import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth';

interface DbPost {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    created_at: string;
    author: string;
    category: string;
    reading_time: number;
    views: number;
    likes: number;
    toc: string | null;
}

export async function GET(request: NextRequest) {
    const adminProtectedGET = withAdminAuth(async () => {
        try {
            const posts = await query<DbPost>(
                `SELECT id, title, slug, description, content, created_at, 
                        author, category, reading_time, views, likes, toc
                 FROM blog_posts
                 ORDER BY created_at DESC`
            );
            return NextResponse.json({
                message: 'مقالات با موفقیت دریافت شدند',
                posts: posts,
            });
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return NextResponse.json({ message: 'خطا در دریافت مقالات' }, { status: 500 });
        }
    }, ['super_admin', 'editor', 'viewer']);
    
    return adminProtectedGET(request);
}

const blogAdminHandler = withAdminAuth(async (request) => {
    if (request.method === 'POST') {
        const { title, slug, description, content, author, category, reading_time, toc } = await request.json();
        
        if (!title || !slug || !content) {
            return NextResponse.json({ message: 'عنوان، نامک و محتوا الزامی هستند' }, { status: 400 });
        }

        try {
            const exists = await query(`SELECT id FROM blog_posts WHERE slug = ?`, [slug]);
            if (exists.length > 0) {
                return NextResponse.json({ message: 'این نامک (Slug) قبلاً استفاده شده است' }, { status: 409 });
            }

            await query(
                `INSERT INTO blog_posts 
                 (title, slug, description, content, author, category, reading_time, toc) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, 
                    slug, 
                    description || '', 
                    content, 
                    author || 'تیم آنتایم', 
                    category || 'مقاله آموزشی', 
                    reading_time || 5,
                    toc ? JSON.stringify(toc) : null
                ]
            );

            return NextResponse.json({ message: 'مقاله با موفقیت منتشر شد' }, { status: 201 });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'خطا در ایجاد مقاله' }, { status: 500 });
        }
    }

    else if (request.method === 'PUT') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'آیدی مقاله الزامی است' }, { status: 400 });

        const { title, slug, description, content, author, category, reading_time, toc } = await request.json();

        try {
            const exists = await query(
                `SELECT id FROM blog_posts WHERE slug = ? AND id != ?`,
                [slug, id]
            );
            if (exists.length > 0) {
                return NextResponse.json({ message: 'این نامک توسط مقاله دیگری استفاده شده' }, { status: 409 });
            }

            const result: any = await query(
                `UPDATE blog_posts 
                 SET title = ?, slug = ?, description = ?, content = ?, 
                     author = ?, category = ?, reading_time = ?, toc = ?
                 WHERE id = ?`,
                [
                    title, slug, description || '', content, 
                    author || 'تیم آنتایم', category || 'مقاله آموزشی', 
                    reading_time || 5, toc ? JSON.stringify(toc) : null, id
                ]
            );

            if (result.affectedRows === 0) {
                return NextResponse.json({ message: 'مقاله پیدا نشد' }, { status: 404 });
            }

            return NextResponse.json({ message: 'مقاله با موفقیت به‌روزرسانی شد' });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'خطا در به‌روزرسانی' }, { status: 500 });
        }
    }

    else if (request.method === 'DELETE') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'آیدی نامعتبر' }, { status: 400 });

        try {
            const result: any = await query(`DELETE FROM blog_posts WHERE id = ?`, [id]);
            if (result.affectedRows === 0) {
                return NextResponse.json({ message: 'مقاله پیدا نشد' }, { status: 404 });
            }
            return NextResponse.json({ message: 'مقاله حذف شد' });
        } catch (error) {
            return NextResponse.json({ message: 'خطا در حذف' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}, ['super_admin', 'editor']);

export async function POST(request: NextRequest) { return blogAdminHandler(request); }
export async function PUT(request: NextRequest) { return blogAdminHandler(request); }
export async function DELETE(request: NextRequest) { return blogAdminHandler(request); }