// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query, QueryResult } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// کد OTP ثابت برای تست
const MOCK_OTP = '123456'; 

/**
 * @method POST
 * دریافت شماره تلفن و یا تایید کد OTP
 */
export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();

        if (!phone) {
            return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
        }

        // --- مرحله اول: ارسال/شبیه‌سازی OTP ---
        if (!otp) {
            const users = await query<{ id: number, name: string }>('SELECT id, name FROM users WHERE phone = ?', [phone]);
            const isRegistered = users.length > 0;
             
            if (!isRegistered) {
                // ثبت موقت کاربر جدید (بدون نام و شغل)
                const result = await query<QueryResult>('INSERT INTO users (phone) VALUES (?)', [phone]);
                const newUserId = result[0].insertId;
                 
                return NextResponse.json({ 
                    message: 'New user created. OTP sent successfully (Mock: 123456). Please verify OTP.', 
                    isRegistered: false,
                    otp: MOCK_OTP, 
                    userId: newUserId 
                });
            }

            console.log(`Sending mock OTP ${MOCK_OTP} to ${phone}`);
            return NextResponse.json({ 
                message: 'OTP sent successfully (Mock: 123456). Please verify OTP.', 
                isRegistered: true,
                otp: MOCK_OTP 
            });
        }
         
        // --- مرحله دوم: تایید OTP و لاگین ---
        if (otp !== MOCK_OTP) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 401 });
        }
         
        const users = await query<{ id: number, job_id: number | null, name: string | null }>('SELECT id, job_id, name FROM users WHERE phone = ?', [phone]);
         
        if (users.length === 0) {
            return NextResponse.json({ message: 'User not found after verification' }, { status: 404 });
        }
         
        const user = users[0];
        const token = generateToken(user.id);
        
        // ⭐️⭐️ تنظیم کوکی امن HTTP-Only ⭐️⭐️
        (await
            // ⭐️⭐️ تنظیم کوکی امن HTTP-Only ⭐️⭐️
            cookies()).set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60, // 7 روز
            path: '/',
            sameSite: 'lax',
        });
         
        // بررسی تکمیل ثبت نام
        const signupComplete = !!user.name && !!user.job_id;

        return NextResponse.json({ 
            message: 'Login successful', 
            signup_complete: signupComplete,
            userId: user.id 
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An error occurred during authentication' }, { status: 500 });
    }
}