// File Path: src\app\api\admin\sms-packs\route.ts

// app/api/sms-packs/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 
import { withAdminAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// --- تعریف نوع داده مورد انتظار از دیتابیس ---
interface DbSmsPackage {
    id: number;
    sms_amount: number;
    is_active: number | boolean; 
    created_at: Date;
}

// --- ابزار کمکی برای فرمت خروجی به فرانت‌اند ---
const formatPackage = (pack: DbSmsPackage) => ({
    id: pack.id,
    count: pack.sms_amount,
    isActive: Boolean(pack.is_active),
});

// ------------------------------------
// GET: فقط نمایش لیست برای ادمین‌ها
// ------------------------------------
export async function GET() {
    const adminProtectedGET = withAdminAuth(async () => {
        try {
            const smsPacks = await query<DbSmsPackage>(
                `SELECT id, sms_amount, is_active, created_at FROM sms_packs ORDER BY sms_amount ASC`
            );
            
            const formattedPacks = smsPacks.map(formatPackage);

            return NextResponse.json({ 
                message: 'SMS packs list fetched successfully', 
                sms_packs: formattedPacks
            });

        } catch (error) {
            console.error('Error fetching SMS packs:', error);
            return NextResponse.json({ 
                message: 'Failed to fetch SMS packs' 
            }, { status: 500 });
        }
    }, ['super_admin', 'editor', 'viewer']); // همه ادمین‌ها می‌توانند ببینند

    return adminProtectedGET(new NextRequest('http://dummy'));
}


// ------------------------------------
// POST, PUT, DELETE: عملیات‌های حساس، نیاز به 'super_admin' یا 'editor' دارند.
// ------------------------------------

const smsPackAdminHandler = withAdminAuth(async (request, context) => {
    // POST: ایجاد بسته جدید
    if (request.method === 'POST') {
        const { count, isActive } = await request.json();

        if ( typeof count !== 'number' || typeof isActive === 'undefined') {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const is_active = isActive ? 1 : 0;
        
        const result: any = await query(
            `INSERT INTO sms_packs ( sms_amount, is_active) VALUES ( ?, ?)`,
            [ count, is_active]
        );
        
        const newPackage = { id: result.insertId, count, isActive };

        return NextResponse.json({ 
            message: 'SMS pack created successfully', 
            sms_pack: newPackage 
        }, { status: 201 });
    }

    // PUT: بروزرسانی بسته موجود
    else if (request.method === 'PUT') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
        }

        const { count, isActive } = await request.json();
        
        if ( typeof count !== 'number' || typeof isActive === 'undefined') {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const is_active = isActive ? 1 : 0;
        
        const result: any = await query(
            `UPDATE sms_packs SET sms_amount = ?, is_active = ? WHERE id = ?`,
            [count, is_active, id]
        );
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Package not found or no change applied' }, { status: 404 });
        }

        const updatedPackage = { id: Number(id), count, isActive };

        return NextResponse.json({ 
            message: 'SMS pack updated successfully', 
            sms_pack: updatedPackage 
        });
    }

    // DELETE: حذف بسته
    else if (request.method === 'DELETE') {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
        }

        const result: any = await query(
            `DELETE FROM sms_packs WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: `SMS pack with ID ${id} deleted successfully` 
        });
    }
    
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    
}, ['super_admin', 'editor']); // اجازه به نقش‌های super_admin و editor برای تغییرات


export async function POST(request: NextRequest) { return smsPackAdminHandler(request); }
export async function PUT(request: NextRequest) { return smsPackAdminHandler(request); }
export async function DELETE(request: NextRequest) { return smsPackAdminHandler(request); }