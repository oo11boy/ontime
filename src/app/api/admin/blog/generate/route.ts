// src/app/api/admin/blog/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { 
  generateBlogPostWithAI, 
  getRandomTopic, 
  markTopicAsUsed,
  categorizedTopics,
  getAvailableTopics
} from "@/lib/ai-service";
import { injectInternalLinksDynamic } from "@/lib/internal-links";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    let { topic, category } = body;
    
    // اگر موضوع مشخص نشده، یک موضوع تصادفی از موضوعات استفاده نشده انتخاب کن
    if (!topic) {
      const randomTopic = getRandomTopic();
      if (!randomTopic) {
        return NextResponse.json(
          { success: false, message: "همه موضوعات استفاده شده‌اند. لطفاً موضوع جدید اضافه کنید." },
          { status: 400 }
        );
      }
      topic = randomTopic.topic;
      category = randomTopic.category;
      console.log("Selected random topic:", topic);
    }
    
    console.log("Generating post for topic:", topic);
    
    // تولید محتوا با هوش مصنوعی
    const post = await generateBlogPostWithAI({ topic, category });
    
    // تزریق لینک‌های داخلی
  const contentWithLinks = await injectInternalLinksDynamic(post.content, topic);
    
    console.log("Generated post:", { title: post.title, slug: post.slug });
    
    // بررسی تکراری نبودن slug
    const existing = await query(
      "SELECT id FROM blog_posts WHERE slug = ?",
      [post.slug]
    );
    
    let finalSlug = post.slug;
    if (existing.length > 0) {
      finalSlug = `${post.slug}-${Date.now()}`;
      console.log("Slug already exists, using:", finalSlug);
    }
    
    // ذخیره در دیتابیس
    await query(
      `INSERT INTO blog_posts 
        (title, slug, description, content, author, category, reading_time, created_at) 
       VALUES (?, ?, ?, ?, 'آنتایم', ?, ?, NOW())`,
      [post.title, finalSlug, post.description, contentWithLinks, category || "مدیریت کسب‌وکار", post.reading_time]
    );
    
    // علامت‌گذاری موضوع به عنوان استفاده شده
    markTopicAsUsed(topic);
    
    return NextResponse.json({
      success: true,
      message: "مقاله با موفقیت تولید و منتشر شد",
      post: {
        title: post.title,
        slug: finalSlug,
        description: post.description,
      },
    });
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    return NextResponse.json(
      { success: false, message: error.message || "خطا در تولید مقاله" },
      { status: 500 }
    );
  }
});

// دریافت لیست موضوعات پیشنهادی (فقط موضوعات استفاده نشده)
export const GET = withAdminAuth(async () => {
  const availableTopics = getAvailableTopics();
  const totalUsed = Object.values(categorizedTopics).reduce(
    (sum, topics) => sum + topics.length, 0
  ) - availableTopics.reduce((sum, cat) => sum + cat.topics.length, 0);
  
  const totalTopics = Object.values(categorizedTopics).reduce(
    (sum, topics) => sum + topics.length, 0
  );
  
  return NextResponse.json({ 
    success: true, 
    categorizedTopics: Object.fromEntries(
      availableTopics.map(cat => [cat.category, cat.topics])
    ),
    stats: {
      total: totalTopics,
      used: totalUsed,
      remaining: totalTopics - totalUsed,
      usedPercent: Math.round((totalUsed / totalTopics) * 100)
    }
  });
});