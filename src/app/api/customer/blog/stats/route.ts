import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { slug, action } = await request.json();
    if (!slug) return NextResponse.json({ message: 'Slug is required' }, { status: 400 });

    // استفاده از هدر استاندارد برای دریافت IP (حل مشکل خطای TS)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    
    const cookieStore = await cookies();

    // --- بخش لایک ---
    if (action === 'like') {
      const cookieKey = `liked_${slug}`;
      const hasLiked = cookieStore.get(cookieKey);

      if (hasLiked) {
        return NextResponse.json({ message: 'Already liked' }, { status: 403 });
      }

      // آپدیت دیتابیس (امن در برابر SQL Injection)
      await query(`UPDATE blog_posts SET likes = likes + 1 WHERE slug = ?`, [slug]);
      
      const updatedPost: any = await query(`SELECT likes FROM blog_posts WHERE slug = ?`, [slug]);
      const response = NextResponse.json({ 
        likes: updatedPost[0]?.likes || 0,
        message: 'ممنون از لایک شما'
      });
      
      // ست کردن کوکی یک‌ساله
      response.cookies.set(cookieKey, 'true', {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    // --- بخش بازدید (View) ---
    if (action === 'view') {
      const viewKey = `viewed_${slug}`;
      const hasViewed = cookieStore.get(viewKey);

      if (!hasViewed) {
        await query(`UPDATE blog_posts SET views = views + 1 WHERE slug = ?`, [slug]);
        const response = NextResponse.json({ message: 'بازدید ثبت شد' });
        
        // جلوگیری از ثبت بازدید تکراری تا ۲ ساعت
        response.cookies.set(viewKey, 'true', { 
          maxAge: 60 * 60 * 2, 
          path: '/',
          httpOnly: true 
        });
        return response;
      }
      return NextResponse.json({ message: 'Already viewed recently' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}