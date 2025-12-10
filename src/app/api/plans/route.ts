// src/app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, QueryResult } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method GET
 * لیست پلن‌های قابل خرید
 */
export async function GET() {
    try {
        const plans = await query<any>('SELECT id, plan_key, title, monthly_fee, free_sms_month, price_per_100_sms FROM plans ORDER BY monthly_fee ASC');
        
        return NextResponse.json({ 
            message: 'Plans list fetched successfully', 
            plans 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch plans' }, { status: 500 });
    }
}

/**
 * @method POST
 * ثبت پلن جدید (نیاز به دسترسی ادمین/مدیریت)
 */
const createPlan = withAuth(async (req: NextRequest, context) => {
    const { userId } = context; // userId از withAuth تزریق شده

    try {
        const { plan_key, title, monthly_fee, free_sms_month, price_per_100_sms } = await req.json();

        if (!plan_key || !title || monthly_fee === undefined) {
            return NextResponse.json({ message: 'Required fields missing' }, { status: 400 });
        }
        
        const insertSql = `
            INSERT INTO plans 
            (plan_key, title, monthly_fee, free_sms_month, price_per_100_sms) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await query<QueryResult>(insertSql, [
            plan_key, 
            title, 
            monthly_fee, 
            free_sms_month || 0, 
            price_per_100_sms || 0.00
        ]);
        
        return NextResponse.json({ 
            message: 'Plan created successfully', 
            planId: result[0].insertId 
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to create plan (Key might be duplicate)' }, { status: 500 });
    }
});

export { createPlan as POST };


