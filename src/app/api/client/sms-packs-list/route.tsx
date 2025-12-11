// app/api/sms-packs/client/route.ts (مسیر عمومی کلاینت)
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 
// در این فایل نیازی به import کردن withAdminAuth نیست.

// --- تعریف نوع داده مورد انتظار از دیتابیس ---
interface DbSmsPackage {
    id: number;
    sms_amount: number;
    is_active: number | boolean;
    // فیلدهای ادمین مثل created_at را حذف می‌کنیم.
}

// --- ابزار کمکی برای فرمت خروجی به فرانت‌اند ---
const formatPackage = (pack: DbSmsPackage) => ({
    id: pack.id,
    count: pack.sms_amount,
    // در این مسیر isActive همیشه true است چون فیلتر شده است.
    isActive: true, 
});


// ------------------------------------
// GET: نمایش لیست بسته‌های فعال برای مشتریان (Public/Client)
// URL: /api/sms-packs/client
// ------------------------------------
export async function GET() {
    try {
        // کوئری برای نمایش فقط بسته‌های فعال (WHERE is_active = 1)
        const smsPacks = await query<DbSmsPackage>(
            `SELECT id, sms_amount, is_active FROM sms_packs WHERE is_active = 1 ORDER BY sms_amount ASC`
        );
        
        const formattedPacks = smsPacks.map(formatPackage);

        return NextResponse.json({ 
            message: 'Active SMS packages list fetched successfully', 
            sms_packs: formattedPacks
        });

    } catch (error) {
        console.error('Error fetching active SMS packs for client:', error);
        return NextResponse.json({ 
            message: 'Failed to fetch SMS packages' 
        }, { status: 500 });
    }
}

