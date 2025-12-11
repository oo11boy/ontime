import { NextResponse } from 'next/server';
// فرض بر این است که این مسیر و تابع query صحیح هستند و منطق دیتابیس را هندل می‌کنند.
import { query } from '@/lib/db'; 

// --- تعریف نوع داده مورد انتظار از دیتابیس ---
interface DbSmsPackage {
    id: number;
   
    sms_amount: number; // تعداد پیامک
    is_active: number | boolean; // 0/1 برای دیتابیس
    created_at: Date;
}

// --- ابزار کمکی برای فرمت خروجی به فرانت‌اند ---
const formatPackage = (pack: DbSmsPackage) => ({
    id: pack.id,

    count: pack.sms_amount,
    isActive: Boolean(pack.is_active),
});

/**
 * @method GET (دریافت لیست همه بسته‌ها)
 */
export async function GET() {
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
}

/**
 * @method POST (ایجاد بسته جدید)
 */
export async function POST(request: Request) {
    try {
        const { count, isActive } = await request.json();

        if ( typeof count !== 'number' || typeof isActive === 'undefined') {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const is_active = isActive ? 1 : 0;
        
        // این تابع باید نتیجه‌ای برگرداند که شامل insertId باشد
        const result: any = await query(
            `INSERT INTO sms_packs ( sms_amount, is_active) VALUES ( ?, ?)`,
            [ count, is_active]
        );
        
        const newPackage = { id: result.insertId, count, isActive };

        return NextResponse.json({ 
            message: 'SMS pack created successfully', 
            sms_pack: newPackage 
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating SMS pack:', error);
        return NextResponse.json({ 
            message: 'Failed to create SMS pack' 
        }, { status: 500 });
    }
}

/**
 * @method PUT (بروزرسانی بسته موجود)
 * مسیر: /api/sms-packs?id=123
 */
export async function PUT(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
        }

        const {  count, isActive } = await request.json();
        
        if ( typeof count !== 'number' || typeof isActive === 'undefined') {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const is_active = isActive ? 1 : 0;
        
        const result: any = await query(
            `UPDATE sms_packs SET  sms_amount = ?, is_active = ? WHERE id = ?`,
            [count, is_active, id]
        );
        
        // چک می‌کنیم که آیا رکوردی واقعاً آپدیت شده است یا خیر (اختیاری)
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Package not found or no change applied' }, { status: 404 });
        }

        const updatedPackage = { id: Number(id), count, isActive };

        return NextResponse.json({ 
            message: 'SMS pack updated successfully', 
            sms_pack: updatedPackage 
        });

    } catch (error) {
        console.error('Error updating SMS pack:', error);
        return NextResponse.json({ 
            message: 'Failed to update SMS pack' 
        }, { status: 500 });
    }
}

/**
 * @method DELETE (حذف بسته)
 * مسیر: /api/sms-packs?id=123
 */
export async function DELETE(request: Request) {
    try {
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

    } catch (error) {
        console.error('Error deleting SMS pack:', error);
        return NextResponse.json({ 
            message: 'Failed to delete SMS pack' 
        }, { status: 500 });
    }
}