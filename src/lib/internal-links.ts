// src/lib/internal-links.ts

import { query } from "@/lib/db";

interface InternalLink {
  title: string;
  url: string;
  type?: string;
  anchor?: string;
  category?: string;
}

// لیست لینک‌های داخلی ثابت با متن‌های طبیعی
const staticLinks: InternalLink[] = [
  { title: "ثبت‌نام در آنتایم", url: "https://ontimeapp.ir", type: "dashboard", anchor: "همین حالا ثبت‌نام کنید" },
  { title: "مشاهده تعرفه‌ها", url: "https://ontimeapp.ir/#pricing", type: "pricing", anchor: "مشاهده تعرفه‌های آنتایم" },
  { title: "دانلود اپلیکیشن", url: "https://ontimeapp.ir/dl", type: "download", anchor: "دانلود اپلیکیشن اندروید آنتایم" },
  { title: "صفحه اصلی", url: "https://ontimeapp.ir", type: "home", anchor: "سامانه نوبت‌دهی آنتایم" },
  { title: "وبلاگ آنتایم", url: "https://ontimeapp.ir/blog", type: "blog", anchor: "مقالات آموزشی آنتایم" },
 { title: "اپلیکیشن اختصاصی مدیریت نوبت برای ناخن‌کاران حرفه‌ای", url: "https://ontimeapp.ir/industries/nail-artist", type: "page", anchor: "اپلیکیشن اختصاصی مدیریت نوبت برای ناخن‌کاران حرفه‌ای" },
  { title: "تخصصی‌ ترین اپلیکیشن مدیریت نوبت و مشتری ویژه آرایشگران و سالن های زیبایی" , url: "https://ontimeapp.ir/industries/beauty-salon", type: "page", anchor: "تخصصی‌ ترین اپلیکیشن مدیریت نوبت و مشتری ویژه آرایشگران و سالن های زیبایی" },
 
];

// کلمات کلیدی و لینک مرتبط (ثابت)
const keywordLinkMap: { [key: string]: InternalLink } = {
  "ثبت نام": { title: "ثبت‌نام در آنتایم", url: "https://ontimeapp.ir", anchor: "همین حالا ثبت‌نام کنید" },
  "عضویت": { title: "ثبت‌نام در آنتایم", url: "https://ontimeapp.ir", anchor: "همین حالا ثبت‌نام کنید" },
  "قیمت": { title: "مشاهده تعرفه‌ها", url: "https://ontimeapp.ir/#pricing", anchor: "مشاهده تعرفه‌های آنتایم" },
  "تعرفه": { title: "مشاهده تعرفه‌ها", url: "https://ontimeapp.ir/#pricing", anchor: "مشاهده تعرفه‌های آنتایم" },
  "هزینه": { title: "مشاهده تعرفه‌ها", url: "https://ontimeapp.ir/#pricing", anchor: "مشاهده تعرفه‌های آنتایم" },
  "دانلود اپ": { title: "دانلود اپلیکیشن", url: "https://ontimeapp.ir/dl", anchor: "دانلود اپلیکیشن اندروید آنتایم" },
  "اپلیکیشن": { title: "دانلود اپلیکیشن", url: "https://ontimeapp.ir/dl", anchor: "دانلود اپلیکیشن اندروید آنتایم" },
  "نصب": { title: "دانلود اپلیکیشن", url: "https://ontimeapp.ir/dl", anchor: "دانلود اپلیکیشن اندروید آنتایم" },
  "نوبت دهی": { title: "ثبت‌نام در آنتایم", url: "https://ontimeapp.ir", anchor: "همین حالا ثبت‌نام کنید" },
};

// حافظه کش برای مقالات ( درخواست به دیتابیس)
let cachedPosts: InternalLink[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 ساعت

// دریافت مقالات مرتبط از دیتابیس
async function fetchRelatedPosts(currentPostId?: number): Promise<InternalLink[]> {
  // بررسی کش
  const now = Date.now();
  if (cachedPosts && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPosts!;
  }
  
  try {
    let querySql = `
      SELECT id, title, slug, category, created_at 
      FROM blog_posts 
      WHERE status = 'published' OR status IS NULL
      ORDER BY created_at DESC 
      LIMIT 30
    `;
    
    const posts = await query(querySql);
    
    cachedPosts = posts.map((post: any) => ({
      title: post.title,
      url: `https://ontimeapp.ir/blog/${post.slug}`,
      type: "blog_post",
      anchor: post.title,
      category: post.category,
    }));
    
    lastFetchTime = now;
    return cachedPosts!;
  } catch (error) {
    console.error("Error fetching posts for internal links:", error);
    return [];
  }
}

// پیدا کردن مقالات مرتبط با topic و content
function findRelevantPosts(
  posts: InternalLink[], 
  topic: string, 
  content: string,
  currentPostId?: number
): InternalLink[] {
  const relevantPosts: InternalLink[] = [];
  const addedUrls = new Set<string>();
  const topicLower = topic.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // کلمات کلیدی برای جستجوی مقالات مرتبط
  const keywords = topicLower.split(" ");
  
  for (const post of posts) {
    if (relevantPosts.length >= 2) break;
    if (currentPostId && post.url.includes(`/blog/${currentPostId}`)) continue;
    
    const postTitleLower = post.title.toLowerCase();
    
    // بررسی ارتباط بر اساس کلمات کلیدی
    let isRelevant = false;
    for (const keyword of keywords) {
      if (keyword.length > 3 && postTitleLower.includes(keyword)) {
        isRelevant = true;
        break;
      }
    }
    
    // بررسی ارتباط بر اساس محتوای مقاله (کلمات کلیدی در متن)
    if (!isRelevant) {
      for (const keyword of keywords) {
        if (keyword.length > 3 && contentLower.includes(keyword)) {
          isRelevant = true;
          break;
        }
      }
    }
    
    if (isRelevant && !addedUrls.has(post.url)) {
      relevantPosts.push({
        ...post,
        anchor: `مطالعه مقاله: ${post.title}`,
      });
      addedUrls.add(post.url);
    }
  }
  
  return relevantPosts;
}

// تابع اصلی برای دریافت لینک‌های مرتبط (داینامیک)
export async function getRelevantLinksDynamic(
  content: string, 
  topic: string,
  currentPostId?: number
): Promise<InternalLink[]> {
  const links: InternalLink[] = [];
  const addedUrls = new Set<string>();
  const contentLower = content.toLowerCase();
  
  // 1. بررسی کلمات کلیدی در محتوا برای لینک‌های ثابت
  for (const [keyword, link] of Object.entries(keywordLinkMap)) {
    if (links.length >= 2) break;
    
    if (contentLower.includes(keyword) && !addedUrls.has(link.url)) {
      links.push(link);
      addedUrls.add(link.url);
    }
  }
  
  // 2. دریافت مقالات دیگر از دیتابیس
  const allPosts = await fetchRelatedPosts(currentPostId);
  
  // 3. پیدا کردن مقالات مرتبط با موضوع
  const relevantPosts = findRelevantPosts(allPosts, topic, content, currentPostId);
  for (const post of relevantPosts) {
    if (links.length >= 4) break;
    if (!addedUrls.has(post.url)) {
      links.push(post);
      addedUrls.add(post.url);
    }
  }
  
  // 4. اضافه کردن لینک‌های ثابت مرتبط با موضوع (اگر جای خالی باشد)
  if (links.length < 3) {
    const topicLower = topic.toLowerCase();
    for (const link of staticLinks) {
      if (links.length >= 3) break;
      
      const isRelevant = 
        (topicLower.includes("نوبت") && link.type === "dashboard") ||
        (topicLower.includes("قیمت") && link.type === "pricing") ||
        (topicLower.includes("دانلود") && link.type === "download") ||
        link.type === "home";
      
      if (isRelevant && !addedUrls.has(link.url)) {
        links.push(link);
        addedUrls.add(link.url);
      }
    }
  }
  
  // 5. اگر باز هم لینکی نیست، لینک به صفحه اصلی و وبلاگ اضافه کن
  if (links.length === 0) {
    links.push({ title: "آنتایم", url: "https://ontimeapp.ir", anchor: "سامانه نوبت‌دهی آنتایم" });
    links.push({ title: "وبلاگ آنتایم", url: "https://ontimeapp.ir/blog", anchor: "مقالات آموزشی آنتایم" });
  }
  
  return links;
}

// تابع تزریق لینک‌ها به مقاله (نسخه داینامیک)
export async function injectInternalLinksDynamic(
  content: string, 
  topic: string,
  currentPostId?: number
): Promise<string> {
  const links = await getRelevantLinksDynamic(content, topic, currentPostId);
  let newContent = content;
  
  // تبدیل لینک‌ها به HTML با طراحی زیبا
  const linksHtml = `
    <div class="related-links-box" style="background:linear-gradient(135deg, #f0fdf4, #dcfce7); padding:25px; border-radius:16px; margin:35px 0; border-right:4px solid #10b981;">
      <h3 style="margin:0 0 15px 0; color:#065f46; font-size:1.2rem;">📚 مطالب پیشنهادی آنتایم</h3>
      <ul style="margin:0; padding-right:20px; list-style-type:circle;">
        ${links.map(link => `<li style="margin-bottom:10px;"><a href="${link.url}" style="color:#059669; text-decoration:none; font-weight:500;" target="_blank">📖 ${link.anchor || link.title}</a></li>`).join('')}
      </ul>
      <div style="margin-top:15px; padding-top:12px; border-top:1px dashed #cbd5e1;">
        <p style="margin:0; font-size:0.85rem; color:#4b5563;">✨ با <a href="https://ontimeapp.ir" style="color:#059669; font-weight:bold;">آنتایم</a>، مدیریت کسب‌وکار خود را هوشمند کنید</p>
      </div>
    </div>
  `;
  
  // قرار دادن لینک‌ها قبل از بخش نتیجه‌گیری
  if (newContent.includes("نتیجه‌گیری")) {
    newContent = newContent.replace("نتیجه‌گیری", `${linksHtml}\n\n## نتیجه‌گیری`);
  } else if (newContent.includes("جمع‌بندی")) {
    newContent = newContent.replace("جمع‌بندی", `${linksHtml}\n\n## جمع‌بندی`);
  } else {
    newContent += `\n\n${linksHtml}`;
  }
  
  return newContent;
}

// تابع برای استفاده غیر async (برای سازگاری با کدهای قبلی - همگام)
export async function injectInternalLinks(content: string, topic: string): Promise<string> {
  return injectInternalLinksDynamic(content, topic);
}

// تابع برای دریافت لینک‌های یک مقاله خاص (برای نمایش در سایت)
export async function getArticleInternalLinks(postId: number, title: string, content: string): Promise<InternalLink[]> {
  return getRelevantLinksDynamic(content, title, postId);
}