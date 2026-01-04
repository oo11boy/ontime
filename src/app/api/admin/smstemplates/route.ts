import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth';

// ۱. دریافت لیست تمام الگوها (مخصوص GET)
export async function GET(request: NextRequest) {
    const adminProtectedGET = withAdminAuth(async () => {
        try {
            const templates = await query(
                `SELECT id, name, type, sub_type, payamresan_id, content, message_count 
                 FROM smstemplates 
                 ORDER BY id DESC`
            );
            return NextResponse.json(templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
            return NextResponse.json({ message: 'خطا در دریافت الگوها' }, { status: 500 });
        }
    }, ['super_admin', 'editor', 'viewer']); 
    
    return adminProtectedGET(request);
}

// ۲. هندلر مشترک برای متدهای POST، PUT و DELETE
const templatesHandler = withAdminAuth(async (request) => {
    
    // --- ایجاد الگوی جدید ---
    if (request.method === 'POST') {
        try {
            const { name, type, sub_type, payamresan_id, content, message_count = 1 } = await request.json();
            
            if (!name || !payamresan_id) {
                return NextResponse.json({ message: 'نام الگو و کد پترن الزامی هستند' }, { status: 400 });
            }

            await query(
                `INSERT INTO smstemplates 
                 (name, type, sub_type, payamresan_id, content, message_count, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [name, type || 'generic', sub_type || 'none', payamresan_id, content || '', message_count]
            );
            return NextResponse.json({ message: 'الگو با موفقیت ایجاد شد' }, { status: 201 });
        } catch (error) {
            console.error('POST Error:', error);
            return NextResponse.json({ message: 'خطا در ایجاد الگو' }, { status: 500 });
        }
    }

    // --- ویرایش الگو ---
    else if (request.method === 'PUT') {
        try {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return NextResponse.json({ message: 'آیدی الگو الزامی است' }, { status: 400 });

            const { name, type, sub_type, payamresan_id, content, message_count = 1 } = await request.json();

            const result: any = await query(
                `UPDATE smstemplates 
                 SET name = ?, type = ?, sub_type = ?, payamresan_id = ?, content = ?, message_count = ? 
                 WHERE id = ?`,
                [name, type, sub_type || 'none', payamresan_id, content || '', message_count, id]
            );

            if (result.affectedRows === 0) {
                return NextResponse.json({ message: 'الگو پیدا نشد' }, { status: 404 });
            }

            return NextResponse.json({ message: 'الگو با موفقیت به‌روزرسانی شد' });
        } catch (error) {
            console.error('PUT Error:', error);
            return NextResponse.json({ message: 'خطا در به‌روزرسانی الگو' }, { status: 500 });
        }
    }

    // --- حذف الگو ---
    else if (request.method === 'DELETE') {
        try {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return NextResponse.json({ message: 'آیدی نامعتبر' }, { status: 400 });

            const result: any = await query(`DELETE FROM smstemplates WHERE id = ?`, [id]);
            if (result.affectedRows === 0) {
                return NextResponse.json({ message: 'الگو پیدا نشد' }, { status: 404 });
            }
            return NextResponse.json({ message: 'الگو با موفقیت حذف شد' });
        } catch (error) {
            console.error('DELETE Error:', error);
            return NextResponse.json({ message: 'خطا در حذف الگو' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}, ['super_admin', 'editor']);

// Export متدها
export async function POST(request: NextRequest) { 
    return templatesHandler(request); 
}

export async function PUT(request: NextRequest) { 
    return templatesHandler(request); 
}

export async function DELETE(request: NextRequest) { 
    return templatesHandler(request); 
}