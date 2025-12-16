// File Path: src\app\api\admin\plans\[id]\route.tsx

// src/app/api/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth'; 
import type { NextRequest } from 'next/server';

const handler = withAdminAuth(async (req: NextRequest, context: any) => {
    let id: string | undefined;

    // 1. **تلاش برای استخراج ID از context.params** (روش استاندارد Next.js)
    if (context.params && context.params.id) {
        id = context.params.id;
    }

    // 2. **Fallback: استخراج ID از URL** (اگر context.params تعریف نشده باشد)
    if (!id) {
        try {
            const url = new URL(req.url);
            // path segments برای /api/admin/plans/2 برابر است با: ['', 'api', 'admin', 'plans', '2']
            const segments = url.pathname.split('/').filter(s => s.length > 0);
            // ID همیشه آخرین سگمنت است.
            id = segments[segments.length - 1];
        } catch (e) {
            console.error("Failed to parse URL for ID:", e);
        }
    }

    if (!id || id === 'plans' || id === 'admin') {
        // چک نهایی برای اطمینان از اینکه ID یک عدد معتبر است و نه نام روت.
        return NextResponse.json({ message: 'Missing or Invalid plan ID in URL' }, { status: 400 });
    }

    // اکنون id را به عنوان متغیر محلی در اختیار داریم.

    // === PUT: ویرایش پلن ===
    if (req.method === 'PUT') {
        try {
                 const { title, monthly_fee, free_sms_month, price_per_100_sms } = await req.json();

            // اعتبارسنجی ساده
            if ([title, monthly_fee, free_sms_month, price_per_100_sms].every(v => v === undefined)) {
                return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
            }
 
            const result = await query<any>(
                `UPDATE plans 
                 SET title = COALESCE(?, title),
                     monthly_fee = COALESCE(?, monthly_fee),
                     free_sms_month = COALESCE(?, free_sms_month),
                     price_per_100_sms = COALESCE(?, price_per_100_sms)

                 WHERE id = ?`,
                [title, monthly_fee, free_sms_month, price_per_100_sms, id]
            );

            if (result[0]?.affectedRows === 0) {
                return NextResponse.json({ message: 'Plan not found or no change applied' }, { status: 404 });
            }

            return NextResponse.json({ message: `Plan ${id} updated successfully` });
        } catch (error) {
            console.error('Error updating plan:', error);
            return NextResponse.json({ message: 'Failed to update plan' }, { status: 500 });
        }
    }

    // === DELETE: حذف پلن ===
    if (req.method === 'DELETE') {
        try {
            const result = await query<any>('DELETE FROM plans WHERE id = ?', [id]);

            if (result[0]?.affectedRows === 0) {
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }

            return NextResponse.json({ message: `Plan ${id} deleted successfully` });
        } catch (error) {
            console.error('Error deleting plan:', error);
            return NextResponse.json({ message: 'Failed to delete plan' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    
}, ['super_admin', 'editor']);


export { handler as PUT, handler as DELETE };