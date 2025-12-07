// src/app/api/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

const handler = withAuth(async (req: NextRequest, context) => {
    const { userId, params: paramsPromise } = context;
    const params = await paramsPromise;
    const { id } = params;

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
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }

            return NextResponse.json({ message: `Plan ${id} updated successfully` });
        } catch (error) {
            console.error(error);
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
            console.error(error);
            return NextResponse.json({ message: 'Failed to delete plan' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
});

export { handler as PUT, handler as DELETE };