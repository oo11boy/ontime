// src/lib/ai-service.ts

const ARVAN_API_URL =
  "https://arvancloudai.ir/gateway/models/DeepSeek-V3.2/hLyayptROELRzkXadTzskOHL1U9nq5_C-URFyo2unQ0LKziT8Z-u9FVV6m2bVpxxuibg6MSe0OaREcoEnfi0p7fkpEAA8SDmxboCukokz5ErJ0zMDL_BGYUYlTtTMMiT4z6FxyN1ht8XrQdnf0GVNy-09aY4NSe8xaFuX9F8nOtgUElc0uPjrs3raK9mQPMa_jQEgrOiDmU903cb1rzKs9IOGWhFXt5ImXEJmYVGefOcfMDv--46gnL9KSTpfaXt/v1/chat/completions";

// نکته امنیتی: بهتر است در آینده این کلید را به env. منتقل کنید.
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
    "بهترین اپلیکیشن مدیریت مطب پزشکی کدام است？",
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

// تابع هوشمند و ضد خطا برای استخراج امن JSON از پاسخ مدل
function extractJSON(text: string): any {
  let cleanedText = text.trim();
  
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/^```json/i, "").replace(/```$/, "").trim();
  }

  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("JSON structure not found in response");
  }

  const jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
  return JSON.parse(jsonStr);
}

export async function generateBlogPostWithAI(
  params: GeneratePostParams,
): Promise<GeneratedPost> {
  const { topic, category = "مدیریت کسب‌وکار" } = params;

  // پرامپت مهندسی‌شده با درک کامل از ویژگی‌های پلتفرم آنتایم
  const prompt = `شما یک کارشناس ارشد سئو و نویسنده محتوای تخصصی هستید. وظیفه شما نگارش یک مقاله جامع، عمیق و کاملاً انسان‌گونه (Human-like) برای وبلاگ سایت "آنتایم" (ontimeapp.ir) درباره موضوع "${topic}" در دسته‌بندی "${category}" است.

[پایگاه دانش - ویژگی‌های کلیدی پلتفرم آنتایم]:
هنگام نوشتن مقاله، در بخش‌های مرتبط حتماً از این ویژگی‌های واقعی و دقیق آنتایم استفاده کن تا متن کاملاً تخصصی و گره‌گشا باشد:
۱. مدیریت هوشمند نوبت‌دهی آنلاین: ثبت نوبت آنلاین توسط مشتریان بدون تماس تلفنی، نمایش زنده و Real-time زمان‌های خالی، و جلوگیری ۱۰۰٪ از تداخل نوبت‌ها.
۲. ارسال خودکار پیامک یادآوری: ارسال پیامک تایید بلافاصله پس از ثبت نوبت، ارسال پیامک یادآوری چند ساعت قبل از موعد (قابل تنظیم توسط مدیر) که باعث کاهش تا ۸۰ درصدی کنسلی نوبت‌ها می‌شود.
۳. مدیریت پیشرفته پرسنل: تعریف چندین پرسنل با دسترسی‌های مجزا، پشتیبانی از دو نوع تقویم کاری (مستقل: برنامه جدا برای هر پرسنل / هماهنگ: برنامه واحد برای کل مجموعه)، اختصاص خدمات تخصصی و همچنین تخصیص اعتبار پیامک مجزا به هر پرسنل.
۴. مدیریت مشتریان (CRM اختصاصی): ذخیره تاریخچه کامل مراجعات، پایش تعداد کنسلی‌ها و سنجش میزان وفاداری مشتری، امکان لیست سیاه یا بلاک کردن مشتریان بدقول، و سیستم جستجو و فیلتر پیشرفته مشتریان.
۵. پورتال و نسخه وب مشتری: نمایش اطلاعات نوبت در قالب یک صفحه وب ساده و شکیل، امکان لغو یا تغییر زمان نوبت توسط خود مشتری (با رعایت محدودیت‌های زمانی که مدیر تعیین می‌کند).
۶. گزارش‌گیری حرفه‌ای و داشبورد تحلیلی: تحلیل دقیق عملکرد پرسنل، آمار زنده نوبت‌ها (فعال، تکمیل‌شده، لغو شده) و سیستم حسابداری ساده برای مشاهده درآمدها و هزینه‌ها.

اصول سئوی پیشرفته و ساختاری که باید دقیقاً رعایت کنی:
۱. الگوریتم Helpful Content گوگل: متن نباید لحن هوش مصنوعی، تکراری یا کلیشه‌ای داشته باشد. از اصطلاحات واقعی بازار کار، مثال‌های ملموس و چالش‌های صاحبان کسب‌وکار استفاده کن.
۲. ساختار و تگ‌های HTML: متن مقاله باید ساختاریافته و با تگ‌های <h2> و <h3> باشد. از لیست‌های نشانه‌دار (<ul> و <li>) استفاده کن.
۳. طول مقاله و عمق محتوا: موضوع را به‌صورت عمیق و جامع (Comprehensive) بررسی کن تا کاربر پاسخ تمام سوالاتش را دریافت کند. متن باید طولانی، ارزشمند و غنی باشد.
۴. چگالی کلمات کلیدی (Keyword Density): کلمات کلیدی مثل "سیستم نوبت دهی"، "اپلیکیشن نوبت دهی" و "مدیریت کسب‌وکار" را به‌صورت کاملاً طبیعی در متن پخش کن (از Keyword Stuffing خودداری شود).
۵. بخش سوالات متداول (FAQ): در انتهای مقاله (قبل از نتیجه‌گیری)، ۳ سوال متداول و مهم کاربران درباره این موضوع را با تگ <h3> بنویس و پاسخ‌های کوتاه و قاطع بده (برای ساختار اسکیما و گرفتن Rich Snippets).
۶. متن مقاله اصلاً نباید حس یک بیانیه تبلیغاتی مستقیم را بدهد، بلکه باید با حل چالش کاربر، پلتفرم "آنتایم" را به عنوان بهترین راهکار معرفی کند.

قوانین سخت‌گیرانه لینک‌سازی داخلی (بین ۲ تا ۴ لینک در کل متن به صورت کاملاً طبیعی توزیع شود):
- هر لینک را فقط و فقط روی "متن دقیقاً مشخص شده" در تگ <a href="..."> قرار بده.
- [متن لینک]: "ثبت‌نام در آنتایم" -> [آدرس]: [https://ontimeapp.ir](https://ontimeapp.ir)
- [متن لینک]: "مشاهده تعرفه‌ها" -> [آدرس]: [https://ontimeapp.ir/#pricing](https://ontimeapp.ir/#pricing)
- [متن لینک]: "دانلود اپلیکیشن آنتایم" -> [آدرس]: [https://ontimeapp.ir/dl](https://ontimeapp.ir/dl)
- [متن لینک]: "اپلیکیشن نوبت‌دهی آرایشگاه و سالن زیبایی آنتایم" -> [آدرس]: [https://ontimeapp.ir/industries/beauty-salon](https://ontimeapp.ir/industries/beauty-salon)
- [متن لینک]: "اپلیکیشن اختصاصی مدیریت نوبت برای ناخن‌کاران حرفه‌ای" -> [آدرس]: [https://ontimeapp.ir/industries/nail-artist](https://ontimeapp.ir/industries/nail-artist)

مشخصات بخش‌های خروجی در قالب JSON:
- title: عنوان جذاب، کلیک‌خور (Title Tag) بین ۵۰ تا ۷۰ کاراکتر که شامل کلمه کلیدی اصلی باشد.
- description: توضیحات متا (Meta Description) ترغیب‌کننده برای افزایش CTR، بین ۱۴۰ تا ۱۶۰ کاراکتر، دارای یک دعوت به اقدام کوتاه.
- slug: یک اسلاگ انگلیسی کوتاه، معنادار، تماماً حروف کوچک، کاملاً مرتبط با موضوع، بدون فینگلیش، جدا شده با خط تیره (مثال: best-salon-booking-software).
- content: کل محتوای مقاله به همراه تگ‌های HTML (شامل h2, h3, p, ul, li, a) و بخش FAQ و CTA نهایی.

خروجی را "فقط و فقط" در قالب ساختار JSON زیر برگردان. هیچ حرف، توضیح، یا تگ \`\`\`json اضافه در ابتدا و انتهای پاسخ قرار نده:
{
  "title": "عنوان مقاله به فارسی",
  "slug": "english-url-slug-here",
  "description": "توضیح کوتاه متا برای سئو",
  "content": "محتوای کامل مقاله با تگ‌های html"
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
        temperature: 0.6, // تعادل عالی بین خلاقیت متن سئو و ساختار فرمت JSON
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

    // محاسبه زمان مطالعه تقریبی (بر اساس تعداد کلمات واقعی متن بدون تگ‌های HTML)
    const wordCount = (parsed.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.max(3, Math.ceil(wordCount / 250));

    return {
      title: parsed.title,
      slug: slug,
      description: parsed.description || parsed.title.substring(0, 150),
      content: parsed.content,
      reading_time: readingTime,
    };
  } catch (error) {
    console.error("Error generating post with AI:", error);
    throw new Error("خطا در تولید محتوای سئو شده با هوش مصنوعی");
  }
}