// src/app/api/plans/route.ts (مسیر مدیریت پلن‌ها - Admin Only)
import { NextRequest, NextResponse } from 'next/server';
import { query, QueryResult } from '@/lib/db';
// تغییر: با توجه به نیاز به دسترسی ادمین، withAdminAuth را اضافه می‌کنیم
import { withAuth, withAdminAuth } from '@/lib/auth'; 

/**
 * @method GET
 * لیست کامل پلن‌ها برای مدیریت (نیاز به دسترسی ادمین)
 */
export async function GET(req: NextRequest) {
    // محافظت از GET با withAdminAuth
    const adminProtectedGET = withAdminAuth(async () => {
        try {
            // ادمین نیاز به دیدن تمام فیلدها و تمام پلن‌ها (فعال و غیرفعال) دارد
            const plans = await query<any>('SELECT id, plan_key, title, monthly_fee, free_sms_month, price_per_100_sms FROM plans ORDER BY monthly_fee ASC');
            
            return NextResponse.json({ 
                message: 'Plans list (Admin) fetched successfully', 
                plans 
            });

        } catch (error) {
            console.error('Error fetching admin plans:', error);
            return NextResponse.json({ message: 'Failed to fetch plans' }, { status: 500 });
        }
    }, ['super_admin', 'editor', 'viewer']); // نقش‌های مجاز برای مشاهده

    return adminProtectedGET(req);
}

/**
 * @method POST
 * ثبت پلن جدید (نیاز به دسترسی ادمین/مدیریت)
 */
// تغییر: POST نیز باید با withAdminAuth محافظت شود.
const createPlan = withAdminAuth(async (req: NextRequest, context) => {
    // context: { userId, userRole, ... }

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
            price_per_100_sms || 0.00,
        ]);
        
        return NextResponse.json({ 
            message: 'Plan created successfully', 
            planId: result[0].insertId 
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ message: 'Failed to create plan (Key might be duplicate)' }, { status: 500 });
    }
}, ['super_admin', 'editor']); // نقش‌های مجاز برای ایجاد

export { createPlan as POST };

