// src/lib/ai-service.ts

const ARVAN_API_URL = "https://arvancloudai.ir/gateway/models/DeepSeek-V3.2/hLyayptROELRzkXadTzskOHL1U9nq5_C-URFyo2unQ0LKziT8Z-u9FVV6m2bVpxxuibg6MSe0OaREcoEnfi0p7fkpEAA8SDmxboCukokz5ErJ0zMDL_BGYUYlTtTMMiT4z6FxyN1ht8XrQdnf0GVNy-09aY4NSe8xaFuX9F8nOtgUElc0uPjrs3raK9mQPMa_jQEgrOiDmU903cb1rzKs9IOGWhFXt5ImXEJmYVGefOcfMDv--46gnL9KSTpfaXt/v1/chat/completions";
const ARVAN_API_KEY = "6d78125c-0779-50f6-b9cb-5e78eb5cb807";

interface GeneratePostParams {
  topic: string;
  category?: string;
}

interface GeneratedPost {
  title: string;
  slug: string;
  description: string;
  content: string;
  reading_time: number;
}

// لیست موضوعات پیشنهادی با دسته‌بندی
export const categorizedTopics = {
  "مدیریت نوبت و زمان": [
    "بهترین سیستم نوبت‌دهی آنلاین برای آرایشگاه زنانه",
    "نرم‌افزار مدیریت نوبت مطب پزشکان و دندانپزشکان",
    "سیستم رزرو نوبت اینترنتی برای سالن زیبایی",
    "مدیریت زمان در آرایشگاه مردانه با اپلیکیشن نوبت‌دهی",
    "نحوه ثبت نوبت آنلاین مشتریان بدون تماس تلفنی",
    "سیستم نوبت‌دهی اختصاصی برای کلینیک پوست و مو",
    "نرم‌افزار مدیریت نوبت آموزشگاه‌های رانندگی",
    "سیستم رزرو نوبت برای باشگاه‌های ورزشی و بدنسازی",
    "مدیریت نوبت مشاوران و روانشناسان آنلاین",
    "نرم‌افزار نوبت‌دهی برای تعمیرگاه‌های خودرو",
  ],
  "کاهش کنسلی و یادآوری": [
    "راهکارهای کاهش کنسلی نوبت در کسب‌وکارهای خدماتی",
    "ارسال پیامک یادآوری نوبت برای کاهش غیبت مشتریان",
    "چگونه مشتریان بدقول را مدیریت کنیم؟",
    "سیستم یادآوری خودکار نوبت با پیامک و نوتیفیکیشن",
    "کاهش ۸۰٪ کنسلی نوبت با پیامک خودکار",
  ],
  "مدیریت پرسنل": [
    "مدیریت چند پرسنل در یک مجموعه خدماتی",
    "نرم‌افزار مدیریت شیفت کاری پرسنل آرایشگاه و سالن زیبایی",
    "تفاوت تقویم مستقل و هماهنگ در مدیریت پرسنل",
    "اختصاص خدمات تخصصی به هر پرسنل در سیستم نوبت‌دهی",
    "مدیریت هوشمند پرسنل در کلینیک‌های پزشکی",
  ],
  "پیامک و بازاریابی": [
    "بازاریابی پیامکی برای جذب مشتریان جدید",
    "ارسال انبوه پیامک تبلیغاتی به مشتریان",
    "بهترین زمان ارسال پیامک تبلیغاتی برای مشاغل خدماتی",
    "نمونه متن پیامک مناسب برای آرایشگاه و مطب پزشک",
    "اتوماسیون پیامکی و افزایش فروش کسب‌وکار",
    "راهنمای جامع ارسال پیامک یادآوری نوبت",
  ],
  "مدیریت مشتریان (CRM)": [
    "نرم‌افزار مدیریت مشتریان (CRM) برای سالن زیبایی",
    "ذخیره تاریخچه مراجعات مشتریان در سیستم نوبت‌دهی",
    "مدیریت وفاداری مشتریان با سیستم پاداش و تخفیف",
    "چگونه مشتریان دائمی برای کسب‌وکار خود بسازیم؟",
    "مدیریت مشتریان با CRM اختصاصی",
  ],
  "مزایا و مقایسه": [
    "مزایای استفاده از سیستم نوبت‌دهی آنلاین نسبت به دفترچه کاغذی",
    "مقایسه بهترین اپلیکیشن‌های نوبت‌دهی ایرانی",
    "چرا کسب‌وکار من به سیستم نوبت‌دهی نیاز دارد؟",
    "صرفه‌جویی در زمان و هزینه با اتوماسیون نوبت‌دهی",
    "افزایش بهره‌وری کسب‌وکار با سیستم نوبت‌دهی",
  ],
  "تکنولوژی و آینده": [
    "آینده صنعت خدمات در ایران با سیستم‌های نوبت‌دهی هوشمند",
    "نقش هوش مصنوعی در بهبود سیستم‌های نوبت‌دهی",
    "اپلیکیشن نوبت‌دهی بدون نیاز به نصب برای مشتریان",
  ],
  "آموزش و راه‌اندازی": [
    "چگونه نوبت دهی آرایشگاه خود را آنلاین کنیم؟",
    "بهترین اپلیکیشن مدیریت مطب پزشکی کدام است؟",
    "آموزش راه‌اندازی سیستم نوبت‌دهی برای سالن زیبایی",
    "هزینه راه‌اندازی سیستم نوبت‌دهی آنلاین چقدر است؟",
  ],
  "آمار و تجربه موفق": [
    "آمار کاهش کنسلی نوبت با سیستم یادآوری پیامکی",
    "تجربه کسب‌وکارهای موفق از استفاده از آنتایم",
    "چگونه نرخ رضایت مشتریان را ۵۰٪ افزایش دهیم؟",
  ],
  "اپلیکیشن و موبایل": [
    "اپلیکیشن مدیریت کسب‌وکار برای اندروید",
    "دانلود اپلیکیشن نوبت‌دهی آنتایم برای موبایل",
    "تفاوت استفاده از اپلیکیشن موبایل با نسخه وب",
  ],
};

// حافظه موضوعات استفاده شده (برای عدم تکرار)
let usedTopics: string[] = [];

export function resetUsedTopics(): void {
  usedTopics = [];
}

export function getAvailableTopics(): { category: string; topics: string[] }[] {
  const available: { category: string; topics: string[] }[] = [];

  for (const [category, topics] of Object.entries(categorizedTopics)) {
    const availableTopics = topics.filter(
      (topic) => !usedTopics.includes(topic),
    );
    if (availableTopics.length > 0) {
      available.push({ category, topics: availableTopics });
    }
  }

  return available;
}

export function getRandomTopic(): { category: string; topic: string } | null {
  const availableCategories = getAvailableTopics();
  if (availableCategories.length === 0) {
    usedTopics = [];
    return getRandomTopic();
  }

  const randomCategory =
    availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const randomTopic =
    randomCategory.topics[
      Math.floor(Math.random() * randomCategory.topics.length)
    ];

  return { category: randomCategory.category, topic: randomTopic };
}

export function markTopicAsUsed(topic: string): void {
  if (!usedTopics.includes(topic)) {
    usedTopics.push(topic);
  }
}

// تابع پاکسازی و normalize اسلاگ انگلیسی
function normalizeEnglishSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // حذف کاراکترهای غیرمجاز
    .replace(/\s+/g, "-") // جایگزینی فاصله با خط تیره
    .replace(/-+/g, "-") // حذف خط تیره‌های تکراری
    .replace(/^-|-$/g, ""); // حذف خط تیره اول و آخر
}

// تابع کمکی برای استخراج JSON از پاسخ
function extractJSON(text: string): any {
  text = text.trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("JSON structure not found in response");
  }

  const jsonStr = text.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonStr);
}

export async function generateBlogPostWithAI(
  params: GeneratePostParams,
): Promise<GeneratedPost> {
  const { topic, category = "مدیریت کسب‌وکار" } = params;

  const prompt = `شما یک نویسنده حرفه‌ای محتوای سئو شده برای وبلاگ سایت ontimeapp.ir هستید. آنتایم (ontimeapp.ir) یک اپلیکیشن نوبت‌دهی و مدیریت کسب‌وکار است.

لطفاً یک مقاله کامل و ارزشمند درباره موضوع "${topic}" بنویسید.

نکات بسیار مهم سئو و لینک‌دهی داخلی:
1. در متن مقاله، حتماً لینک‌های داخلی طبیعی به صفحات زیر اضافه کنید:
   - صفحه اصلی: https://ontimeapp.ir
   - صفحه ثبت‌نام: https://ontimeapp.ir با متن "ثبت‌نام در آنتایم"
   - صفحه تعرفه‌ها: https://ontimeapp.ir/#pricing با متن "مشاهده تعرفه‌ها"
   - صفحه دانلود اپلیکیشن: https://ontimeapp.ir/dl با متن "دانلود اپلیکیشن آنتایم"
2. از کلمات کلیدی اصلی مثل "سیستم نوبت‌دهی"، "اپلیکیشن نوبت‌دهی"، "مدیریت کسب‌وکار" استفاده کنید
3. عنوان مقاله جذاب و سئو شده باشد (بین 50 تا 70 کاراکتر)
4. توضیحات متا (description) جذاب و بین 150 تا 160 کاراکتر باشد
5. محتوای مقاله حداقل 1200 کلمه باشد
6. شامل تیترهای h2 و h3 مناسب باشد
7. در انتها یک بخش نتیجه‌گیری و دعوت به اقدام (CTA) داشته باشد
8. نویسنده را "آنتایم" بنویسید

**مهم: برای سئوی بهتر، یک اسلاگ انگلیسی (URL-friendly) برای مقاله تولید کن. اسلاگ باید:
   - کاملاً به انگلیسی باشد (نه فینگلیش)
   - شامل کلمات کلیدی اصلی مقاله باشد
   - بین 3 تا 6 کلمه باشد
   - با خط تیره (-) جدا شده باشد
   - مثال: "best-appointment-system-for-salons"

خروجی را در قالب JSON زیر برگردان (فقط JSON، بدون هیچ توضیح اضافه):

{
  "title": "عنوان مقاله به فارسی",
  "slug": "english-url-slug-here",
  "description": "توضیح کوتاه متا برای سئو در 160 کاراکتر",
  "content": "محتوای کامل مقاله با تگ‌های html که شامل لینک‌های داخلی طبیعی است"
}`;

  try {
    const response = await fetch(ARVAN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apikey ${ARVAN_API_KEY}`,
      },
      body: JSON.stringify({
        model: "DeepSeek-V3.2",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4500,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Invalid JSON response from API");
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid API response structure");
    }

    const rawContent = data.choices[0].message.content;
    const parsed = extractJSON(rawContent);

    // نرمال‌سازی اسلاگ انگلیسی
    const slug = normalizeEnglishSlug(parsed.slug || parsed.title);
    
    const wordCount = (parsed.content || "").replace(/<[^>]*>/g, "").length / 5;
    const readingTime = Math.max(5, Math.ceil(wordCount / 200));

    return {
      title: parsed.title,
      slug: slug,
      description: parsed.description || parsed.title.substring(0, 150),
      content: parsed.content,
      reading_time: readingTime,
    };
  } catch (error) {
    console.error("Error generating post with AI:", error);
    throw new Error("خطا در تولید محتوا با هوش مصنوعی");
  }
}