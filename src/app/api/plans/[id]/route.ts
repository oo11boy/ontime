// src/app/api/plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method PUT
 * ویرایش پلن (نیاز به دسترسی ادمین/مدیریت)
 */
const updatePlan = withAuth(async (req: Request, userId: number, params: { id: string }) => {
    try {
        const { id } = params;
        const { title, monthly_fee, free_sms_month, price_per_100_sms } = await req.json();

        const updateSql = `
            UPDATE plans 
            SET title = ?, monthly_fee = ?, free_sms_month = ?, price_per_100_sms = ?
            WHERE id = ?
        `;
        const result = await query<any>(updateSql, [
            title, 
            monthly_fee, 
            free_sms_month, 
            price_per_100_sms, 
            id
        ]);
        
        if (result[0].affectedRows === 0) {
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: `Plan ${id} updated successfully` 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to update plan' }, { status: 500 });
    }
});

/**
 * @method DELETE
 * حذف پلن (نیاز به دسترسی ادمین/مدیریت)
 */
const deletePlan = withAuth(async (req: Request, userId: number, params: { id: string }) => {
    try {
        const { id } = params;
        
        const result = await query<any>(
            'DELETE FROM plans WHERE id = ?', 
            [id]
        );

        if (result[0].affectedRows === 0) {
            return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: `Plan ${id} deleted successfully` 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete plan' }, { status: 500 });
    }
});

// اصلاح شده: export مستقیم تابع‌های بسته‌بندی شده
export { updatePlan as PUT, deletePlan as DELETE };