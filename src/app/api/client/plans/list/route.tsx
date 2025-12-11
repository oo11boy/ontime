// src/app/api/plans/client/route.ts (مسیر عمومی کلاینت)
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ------------------------------------
// GET: لیست پلن‌های فعال (Public/Client)
// URL: /api/plans/client
// ------------------------------------
/**
 * @method GET
 * لیست پلن‌های فعال برای مشتریان جهت مشاهده و خرید.
 */
export async function GET() {
    try {

        const plans = await query<any>(
            'SELECT id, plan_key, title, monthly_fee, free_sms_month, price_per_100_sms FROM plans ORDER BY monthly_fee ASC'
        );
        
        return NextResponse.json({ 
            message: 'Active plans list fetched successfully', 
            plans 
        });

    } catch (error) {
        console.error('Error fetching client plans:', error);
        return NextResponse.json({ message: 'Failed to fetch plans' }, { status: 500 });
    }
}
