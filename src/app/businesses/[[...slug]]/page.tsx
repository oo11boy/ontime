// src/app/businesses/[[...slug]]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { query } from "@/lib/db";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import Navigation from "@/components/Landing/Navigation";

function decodeSlug(encodedSlug: string): string {
  try {
    return decodeURIComponent(encodedSlug);
  } catch {
    return encodedSlug;
  }
}

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ sort?: string; page?: string; q?: string }>;
};

// ==================== تابع دریافت اطلاعات با پشتیبانی کامل ====================
async function getBusinessesAndFilters(
  slug: string[] = [], 
  sort: string = "visits", 
  page: number = 1,
  searchQuery?: string
) {
  const limit = 12;
  const offset = (page - 1) * limit;
  
  let city: string | null = null;
  let jobSlug: string | null = null;
  let jobId: number | null = null;
  let serviceSlug: string | null = null;
  let serviceName: string | null = null;
  
  let isValidCombination = true;
  let notFoundReason: string | null = null;
  
  const allCities = await query<any>(
    "SELECT DISTINCT city FROM customer_links WHERE is_active = 1 AND is_deleted = 0 AND city IS NOT NULL AND city != ''"
  );
  const cityNames = new Set(allCities.map((c: any) => c.city));
  
  const allJobs = await query<any>(
    "SELECT english_name, id, persian_name FROM jobs WHERE english_name IS NOT NULL"
  );
  const jobMap = new Map(allJobs.map((j: any) => [j.english_name, { id: j.id, persian_name: j.persian_name }]));
  
  const allServices = await query<any>(
    `SELECT DISTINCT 
      JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name
     FROM customer_links cl
     CROSS JOIN (
       SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
       UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
       UNION SELECT 8 UNION SELECT 9
     ) numbers
     WHERE cl.is_active = 1 
       AND cl.is_deleted = 0
       AND cl.services IS NOT NULL
       AND JSON_LENGTH(cl.services) > n
     GROUP BY service_name`
  );
  const serviceNames = new Set(allServices.map((s: any) => s.service_name));
  
  if (slug && slug.length > 0) {
    const decodedSlug = slug.map(s => decodeSlug(s));
    
    if (decodedSlug.length === 1) {
      if (cityNames.has(decodedSlug[0])) {
        city = decodedSlug[0];
      } else if (jobMap.has(decodedSlug[0])) {
        jobSlug = decodedSlug[0];
        jobId = jobMap.get(decodedSlug[0])?.id;
      } else {
        isValidCombination = false;
        notFoundReason = `"${decodedSlug[0]}" نه شهر معتبر است و نه شغل معتبر`;
      }
    } 
    else if (decodedSlug.length === 2) {
      const firstIsCity = cityNames.has(decodedSlug[0]);
      const firstIsJob = jobMap.has(decodedSlug[0]);
      const secondIsJob = jobMap.has(decodedSlug[1]);
      const secondIsService = serviceNames.has(decodedSlug[1].replace(/-/g, " "));
      
      if (firstIsCity && secondIsJob) {
        city = decodedSlug[0];
        jobSlug = decodedSlug[1];
        jobId = jobMap.get(decodedSlug[1])?.id;
      } 
      else if (firstIsJob && secondIsService) {
        jobSlug = decodedSlug[0];
        jobId = jobMap.get(decodedSlug[0])?.id;
        serviceSlug = decodedSlug[1];
        serviceName = serviceSlug?.replace(/-/g, " ");
      }
      else if (firstIsCity && secondIsService) {
        city = decodedSlug[0];
        serviceSlug = decodedSlug[1];
        serviceName = serviceSlug?.replace(/-/g, " ");
      }
      else if (firstIsJob && secondIsJob) {
        jobSlug = decodedSlug[0];
        jobId = jobMap.get(decodedSlug[0])?.id;
      }
      else {
        isValidCombination = false;
        notFoundReason = `ترکیب "${decodedSlug[0]}/${decodedSlug[1]}" معتبر نیست`;
      }
    } 
    else if (decodedSlug.length === 3) {
      const firstIsCity = cityNames.has(decodedSlug[0]);
      const secondIsJob = jobMap.has(decodedSlug[1]);
      const thirdIsService = serviceNames.has(decodedSlug[2].replace(/-/g, " "));
      
      if (firstIsCity && secondIsJob && thirdIsService) {
        city = decodedSlug[0];
        jobSlug = decodedSlug[1];
        jobId = jobMap.get(decodedSlug[1])?.id;
        serviceSlug = decodedSlug[2];
        serviceName = serviceSlug?.replace(/-/g, " ");
      } 
      else if (firstIsCity && secondIsJob && !thirdIsService) {
        city = decodedSlug[0];
        jobSlug = decodedSlug[1];
        jobId = jobMap.get(decodedSlug[1])?.id;
      }
      else if (firstIsCity && !secondIsJob && thirdIsService) {
        city = decodedSlug[0];
        serviceSlug = decodedSlug[2];
        serviceName = serviceSlug?.replace(/-/g, " ");
      }
      else {
        isValidCombination = false;
        notFoundReason = `ترکیب "${decodedSlug[0]}/${decodedSlug[1]}/${decodedSlug[2]}" معتبر نیست`;
      }
    }
    else if (decodedSlug.length > 3) {
      const firstIsCity = cityNames.has(decodedSlug[0]);
      const secondIsJob = jobMap.has(decodedSlug[1]);
      
      if (firstIsCity && secondIsJob) {
        city = decodedSlug[0];
        jobSlug = decodedSlug[1];
        jobId = jobMap.get(decodedSlug[1])?.id;
      } else if (firstIsCity) {
        city = decodedSlug[0];
      } else if (jobMap.has(decodedSlug[0])) {
        jobSlug = decodedSlug[0];
        jobId = jobMap.get(decodedSlug[0])?.id;
      }
    }
  }
  
  let conditions = ["cl.is_active = 1", "cl.is_deleted = 0"];
  const params: any[] = [];
  
  if (city) {
    conditions.push("cl.city = ?");
    params.push(city);
  }
  
  if (jobId) {
    conditions.push("u.job_id = ?");
    params.push(jobId);
  }
  
  if (serviceName) {
    conditions.push(`JSON_SEARCH(cl.services, 'one', ?, NULL, '$[*].name') IS NOT NULL`);
    params.push(serviceName);
  }
  
  if (searchQuery) {
    conditions.push(`(cl.business_name LIKE ? OR cl.bio LIKE ?)`);
    params.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }
  
  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  
  const orderBy = {
    visits: "cl.total_visits DESC",
    rating: "avg_rating DESC",
    newest: "cl.created_at DESC"
  }[sort] || "cl.total_visits DESC";
  
  const businesses = await query<any>(
    `SELECT 
      cl.business_name,
      cl.province,
      cl.city,
      cl.avatar_image,
      cl.cover_image,
      cl.services,
      cl.bio,
      cl.slug,
      cl.total_visits,
      j.id as job_id,
      j.persian_name as job_name,
      j.english_name as job_slug,
      (SELECT COUNT(*) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as review_count,
      (SELECT AVG(rating) FROM reviews WHERE user_id = cl.user_id AND status = 'approved') as avg_rating
    FROM customer_links cl
    LEFT JOIN users u ON cl.user_id = u.id
    LEFT JOIN jobs j ON u.job_id = j.id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  
  const countResult = await query<any>(
    `SELECT COUNT(*) as total FROM customer_links cl
    LEFT JOIN users u ON cl.user_id = u.id
    ${whereClause}`,
    params
  );
  
  const categories = await query<any>(
    `SELECT j.id, j.persian_name as name, j.english_name as slug,
     COUNT(cl.id) as business_count
    FROM jobs j
    LEFT JOIN users u ON u.job_id = j.id
    LEFT JOIN customer_links cl ON cl.user_id = u.id AND cl.is_active = 1 AND cl.is_deleted = 0
    GROUP BY j.id
    HAVING business_count > 0
    ORDER BY business_count DESC`
  );
  
  const cities = await query<any>(
    `SELECT city, COUNT(*) as business_count
    FROM customer_links
    WHERE is_active = 1 AND is_deleted = 0 AND city IS NOT NULL AND city != ''
    GROUP BY city
    HAVING business_count > 0
    ORDER BY business_count DESC
    LIMIT 20`
  );
  
  const popularServices = await query<any>(
    `SELECT 
      JSON_UNQUOTE(JSON_EXTRACT(cl.services, CONCAT('$[', n, '].name'))) as service_name,
      COUNT(*) as business_count
    FROM customer_links cl
    CROSS JOIN (
      SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
      UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 
      UNION SELECT 8 UNION SELECT 9
    ) numbers
    WHERE cl.is_active = 1 
      AND cl.is_deleted = 0
      AND cl.services IS NOT NULL
      AND JSON_LENGTH(cl.services) > n
    GROUP BY service_name
    HAVING business_count > 0
    ORDER BY business_count DESC
    LIMIT 15`
  );
  
  return {
    businesses: businesses.map((b: any) => ({
      ...b,
      services: b.services ? JSON.parse(b.services) : [],
      avg_rating: parseFloat(b.avg_rating) || 0,
      review_count: parseInt(b.review_count) || 0
    })),
    total: countResult[0]?.total || 0,
    categories,
    cities,
    popularServices: popularServices.map((s: any) => ({
      name: s.service_name,
      business_count: parseInt(s.business_count),
      slug: s.service_name.replace(/[^آ-یa-zA-Z0-9]/g, "-").toLowerCase()
    })),
    currentFilters: { city, jobSlug, jobId, serviceName, serviceSlug, searchQuery },
    isValidCombination,
    notFoundReason
  };
}

// ==================== متادیتای کامل سئو ====================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const { sort = "visits", page = "1", q } = await searchParams;
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  const currentPage = parseInt(page);
  
  const buildCanonicalUrl = () => {
    const parts: string[] = [];
    if (decodedSlug[0] && decodedSlug[0] !== "undefined") parts.push(encodeURIComponent(decodedSlug[0]));
    if (decodedSlug[1] && decodedSlug[1] !== "undefined") parts.push(encodeURIComponent(decodedSlug[1]));
    if (decodedSlug[2] && decodedSlug[2] !== "undefined") parts.push(encodeURIComponent(decodedSlug[2]));
    let url = `/businesses${parts.length ? `/${parts.join("/")}` : ""}`;
    const queryParams = new URLSearchParams();
    if (sort && sort !== "visits") queryParams.set("sort", sort);
    if (currentPage && currentPage > 1) queryParams.set("page", currentPage.toString());
    if (q) queryParams.set("q", q);
    const queryString = queryParams.toString();
    return `${url}${queryString ? `?${queryString}` : ""}`;
  };
  
  const buildPrevNextUrls = () => {
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = null; // این رو بعداً با totalPages محاسبه می‌کنیم
    return { prevPage, nextPage };
  };
  
  if (q) {
    const pageTitle = `جستجوی "${q}" | آنتایم | بهترین نتایج کسب و کار`;
    const pageDescription = `✨ نتایج جستجوی "${q}" در آنتایم — لیست کامل بهترین کسب و کارها، خدمات و ارائه‌دهندگان حرفه‌ای در ایران. آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین`;
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: `${q}, جستجو کسب و کار, لیست مشاغل, آنتایم, رزرو آنلاین, نوبت دهی`,
      alternates: { canonical: buildCanonicalUrl() },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: buildCanonicalUrl(),
        siteName: "آنتایم",
        type: "website",
        locale: "fa_IR",
      },
      twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription },
    };
  }
  
  const allJobs = await query<any>("SELECT english_name, persian_name FROM jobs");
  const jobMap = new Map(allJobs.map((j: any) => [j.english_name, j.persian_name]));
  
  const allCities = await query<any>("SELECT DISTINCT city FROM customer_links WHERE is_active = 1 AND city IS NOT NULL");
  const citySet = new Set(allCities.map((c: any) => c.city));
  
  let title = "لیست کامل کسب و کارهای ایران | آنتایم | رزرو آنلاین خدمات";
  let description = "🔍 بهترین کسب و کارهای ایران را پیدا کنید — مقایسه، مشاهده نظرات کاربران و رزرو آنلاین نوبت از بهترین ارائه‌دهندگان خدمات در سراسر کشور";
  let keywords = "لیست کسب و کار, رزرو آنلاین, نوبت دهی, مشاغل برتر ایران";
  
  if (decodedSlug.length === 1) {
    if (citySet.has(decodedSlug[0])) {
      title = `لیست کامل کسب و کارهای ${decodedSlug[0]} | آنتایم | رزرو آنلاین نوبت`;
      description = `🏙️ بهترین کسب و کارهای شهر ${decodedSlug[0]} شامل آرایشگران، پزشکان، وکلا، تعمیرکاران و... به همراه آدرس، شماره تماس، نظرات کاربران و امکان رزرو آنلاین. مقایسه و انتخاب بهترین ارائه‌دهندگان خدمات در ${decodedSlug[0]}`;
      keywords = `کسب و کار ${decodedSlug[0]}, لیست مشاغل ${decodedSlug[0]}, رزرو نوبت ${decodedSlug[0]}, خدمات ${decodedSlug[0]}`;
    } else if (jobMap.has(decodedSlug[0])) {
      const jobName = jobMap.get(decodedSlug[0]);
      title = `لیست بهترین ${jobName}‌های ایران | آنتایم | مقایسه و رزرو آنلاین`;
      description = `✨ بهترین ${jobName}‌های ایران به همراه آدرس، شماره تماس، نظرات کاربران و امتیازات — مقایسه و رزرو آنلاین نوبت از بهترین ارائه‌دهندگان خدمات ${jobName} در سراسر کشور`;
      keywords = `${jobName}, لیست ${jobName}‌های برتر, بهترین ${jobName} ایران, رزرو ${jobName}`;
    }
  } else if (decodedSlug.length === 2) {
    if (citySet.has(decodedSlug[0]) && jobMap.has(decodedSlug[1])) {
      const jobName = jobMap.get(decodedSlug[1]);
      title = `بهترین ${jobName}‌های ${decodedSlug[0]} | لیست کامل + رزرو آنلاین | آنتایم`;
      description = `📍 لیست بهترین ${jobName}‌های شهر ${decodedSlug[0]} به همراه آدرس، شماره تماس، نظرات کاربران و امتیازات — رزرو آنلاین نوبت از بهترین ${jobName}‌های ${decodedSlug[0]}. مقایسه کیفیت خدمات و هزینه`;
      keywords = `${jobName} در ${decodedSlug[0]}, لیست ${jobName}‌های ${decodedSlug[0]}, رزرو نوبت ${jobName}, بهترین ${jobName} ${decodedSlug[0]}`;
    } else if (jobMap.has(decodedSlug[0])) {
      const jobName = jobMap.get(decodedSlug[0]);
      const serviceName = decodedSlug[1].replace(/-/g, " ");
      title = `بهترین ارائه‌دهندگان خدمات ${serviceName} (${jobName}) | آنتایم`;
      description = `✨ لیست بهترین ${jobName}‌های ایران که خدمات ${serviceName} را ارائه می‌دهند — آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین. مقایسه تخصص و تجربه ارائه‌دهندگان`;
      keywords = `${serviceName}, ${jobName} ${serviceName}, خدمات ${serviceName}, رزرو ${serviceName}`;
    } else if (citySet.has(decodedSlug[0])) {
      const serviceName = decodedSlug[1].replace(/-/g, " ");
      title = `بهترین ارائه‌دهندگان خدمات ${serviceName} در ${decodedSlug[0]} | آنتایم`;
      description = `🏢 لیست بهترین کسب و کارهای شهر ${decodedSlug[0]} که خدمات ${serviceName} را ارائه می‌دهند — آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین. انتخاب بهترین ${serviceName} در ${decodedSlug[0]}`;
      keywords = `${serviceName} در ${decodedSlug[0]}, خدمات ${serviceName}, بهترین ${serviceName}, ${serviceName} حرفه‌ای`;
    }
  } else if (decodedSlug.length === 3) {
    if (citySet.has(decodedSlug[0]) && jobMap.has(decodedSlug[1])) {
      const jobName = jobMap.get(decodedSlug[1]);
      const serviceName = decodedSlug[2].replace(/-/g, " ");
      title = `بهترین ارائه‌دهندگان خدمات ${serviceName} در ${decodedSlug[0]} (${jobName}) | آنتایم`;
      description = `⭐ لیست بهترین ${jobName}‌های شهر ${decodedSlug[0]} که خدمات ${serviceName} را ارائه می‌دهند — به همراه آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین. مقایسه کیفیت و هزینه خدمات ${serviceName}`;
      keywords = `${serviceName} در ${decodedSlug[0]}, ${jobName} ${serviceName}, رزرو ${serviceName}, بهترین ${serviceName} ${decodedSlug[0]}`;
    }
  }
  
  return {
    title,
    description,
    keywords,
    alternates: { canonical: buildCanonicalUrl() },
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(),
      siteName: "آنتایم",
      type: "website",
      locale: "fa_IR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ==================== تابع ساخت URL ====================
function buildBusinessUrl(city?: string, job?: string, service?: string, sort?: string, page?: number, q?: string): string {
  const parts: string[] = [];
  if (city) parts.push(encodeURIComponent(city));
  if (job) parts.push(encodeURIComponent(job));
  if (service) parts.push(encodeURIComponent(service.replace(/ /g, "-").toLowerCase()));
  
  let url = `/businesses${parts.length ? `/${parts.join("/")}` : ""}`;
  
  const queryParams = new URLSearchParams();
  if (sort && sort !== "visits") queryParams.set("sort", sort);
  if (page && page > 1) queryParams.set("page", page.toString());
  if (q) queryParams.set("q", q);
  
  const queryString = queryParams.toString();
  return `${url}${queryString ? `?${queryString}` : ""}`;
}

// ==================== تابع ساخت Breadcrumb ====================
function buildBreadcrumbItems(slug: string[], categories: any[], currentFilters: any, q?: string) {
  const items = [{ name: "خانه", url: "/" }, { name: "کسب و کارها", url: "/businesses" }];
  
  if (q) {
    items.push({ name: `جستجو: ${q}`, url: `/businesses?q=${q}` });
    return items;
  }
  
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  
  if (decodedSlug[0]) {
    const isCity = currentFilters.city === decodedSlug[0];
    const isJob = categories.find(c => c.slug === decodedSlug[0]);
    if (isCity) items.push({ name: `شهر ${decodedSlug[0]}`, url: `/businesses/${encodeURIComponent(decodedSlug[0])}` });
    else if (isJob) items.push({ name: isJob.name, url: `/businesses/${encodeURIComponent(decodedSlug[0])}` });
    else items.push({ name: decodedSlug[0], url: `/businesses/${encodeURIComponent(decodedSlug[0])}` });
  }
  
  if (decodedSlug[1]) {
    const isJob = categories.find(c => c.slug === decodedSlug[1]);
    if (isJob) items.push({ name: isJob.name, url: `/businesses/${encodeURIComponent(decodedSlug[0])}/${encodeURIComponent(decodedSlug[1])}` });
    else items.push({ name: decodedSlug[1].replace(/-/g, " "), url: `/businesses/${encodeURIComponent(decodedSlug[0])}/${encodeURIComponent(decodedSlug[1])}` });
  }
  
  if (decodedSlug[2]) {
    items.push({ name: decodedSlug[2].replace(/-/g, " "), url: `/businesses/${encodeURIComponent(decodedSlug[0])}/${encodeURIComponent(decodedSlug[1])}/${encodeURIComponent(decodedSlug[2])}` });
  }
  
  return items;
}

// ==================== تابع تولید محتوای متنی پایین صفحه ====================
function getFooterContent(currentFilters: any, categories: any[], total: number, q?: string) {
  if (q) {
    return {
      title: `جستجوی "${q}" در آنتایم | سامانه هوشمند نوبت‌دهی`,
      content: `آنتایم یک اپلیکیشن حرفه‌ای برای مدیریت نوبت‌دهی کسب و کارهاست. شما با جستجوی "${q}" میتوانید لیست کاملی از کسب و کارهای مرتبط را مشاهده کنید. هر کسب و کار در آنتایم یک صفحه اختصاصی دارد که مشتریان میتوانند به راحتی و بدون تماس تلفنی، نوبت خود را ثبت کنند. سیستم پیامک خودکار آنتایم، پیامک تأیید رزرو و یادآوری نوبت را به مشتریان ارسال میکند تا هیچ نوبتی فراموش نشود.`
    };
  }
  
  if (currentFilters.city && currentFilters.jobSlug && currentFilters.serviceName) {
    const job = categories.find(c => c.slug === currentFilters.jobSlug);
    return {
      title: `راهنمای انتخاب ${job?.name || currentFilters.jobSlug} حرفه‌ای در ${currentFilters.city} برای خدمات ${currentFilters.serviceName} | آنتایم`,
      content: `آنتایم سامانه هوشمند نوبت‌دهی آنلاین است. کسب و کارهای ${job?.name || currentFilters.jobSlug} در ${currentFilters.city} که خدمات ${currentFilters.serviceName} را ارائه میدهند، در آنتایم دارای صفحه اختصاصی هستند. مشتریان میتوانند با مراجعه به لینک اختصاصی هر کسب و کار، بدون نیاز به تماس تلفنی، نوبت خود را ثبت کنند. همچنین سیستم پیامک خودکار آنتایم، پیامک تأیید رزرو و یادآوری نوبت را برای مشتریان ارسال میکند.`
    };
  }
  
  if (currentFilters.city && currentFilters.jobSlug) {
    const job = categories.find(c => c.slug === currentFilters.jobSlug);
    return {
      title: `لیست کامل ${job?.name || currentFilters.jobSlug}‌های ${currentFilters.city} | نوبت‌دهی آنلاین با آنتایم`,
      content: `آنتایم اپلیکیشن حرفه‌ای مدیریت نوبت‌دهی کسب و کارهاست. هر ${job?.name || currentFilters.jobSlug} در ${currentFilters.city} که در آنتایم ثبت‌نام کند، یک صفحه اختصاصی دریافت میکند. مشتریان میتوانند با دریافت لینک صفحه اختصاصی، به سادگی و در هر ساعت از شبانه‌روز نوبت خود را ثبت کنند. آنتایم علاوه بر ثبت نوبت آنلاین، پیامک تأیید رزرو و یادآوری خودکار نوبت را نیز ارسال میکند تا تجربه‌ای حرفه‌ای برای مشتریان شما رقم بخورد.`
    };
  }
  
  if (currentFilters.city && currentFilters.serviceName) {
    return {
      title: `بهترین ارائه‌دهندگان خدمات ${currentFilters.serviceName} در ${currentFilters.city} | آنتایم`,
      content: `با آنتایم، بهترین ارائه‌دهندگان خدمات ${currentFilters.serviceName} در ${currentFilters.city} را پیدا کنید. آنتایم یک پلتفرم نوبت‌دهی آنلاین است که به هر کسب و کار یک صفحه اختصاصی میدهد. مشتریان میتوانند با استفاده از لینک اختصاصی کسب و کار، بدون تماس تلفنی و فقط در چند کلیک، نوبت خود را ثبت کنند. همچنین سیستم هوشمند آنتایم، پیامک تأیید و یادآوری نوبت را به صورت خودکار ارسال میکند.`
    };
  }
  
  if (currentFilters.jobSlug && currentFilters.serviceName) {
    const job = categories.find(c => c.slug === currentFilters.jobSlug);
    return {
      title: `راهنمای انتخاب ${job?.name || currentFilters.jobSlug} برای خدمات ${currentFilters.serviceName} | آنتایم`,
      content: `آنتایم، سامانه جامع نوبت‌دهی آنلاین، به شما کمک میکند بهترین ${job?.name || currentFilters.jobSlug}‌های ارائه‌دهنده خدمات ${currentFilters.serviceName} را پیدا کنید. کسب و کارهای عضو آنتایم، یک صفحه اختصاصی با لینک سفارشی دارند. مشتریان میتوانند با ورود به این لینک، نوبت خود را ثبت کنند و پیامک تأیید و یادآوری را دریافت نمایند. دیگر خبری از تماس‌های مکرر تلفنی و فراموشی نوبت نیست!`
    };
  }
  
  if (currentFilters.city) {
    return {
      title: `راهنمای کامل کسب و کارهای ${currentFilters.city} | رزرو آنلاین نوبت با آنتایم`,
      content: `آنتایم اپلیکیشن هوشمند نوبت‌دهی است که به کسب و کارهای شهر ${currentFilters.city} امکان میدهد صفحه اختصاصی خود را داشته باشند. مشتریان میتوانند با دریافت لینک اختصاصی هر کسب و کار، به سادگی نوبت خود را ثبت کنند. سیستم آنتایم به طور خودکار پیامک تأیید رزرو و پیامک یادآوری نوبت را برای مشتریان ارسال میکند. این یعنی مدیریت حرفه‌ای نوبت‌دهی بدون سردرد و تماس‌های بی‌نتیجه!`
    };
  }
  
  if (currentFilters.jobSlug) {
    const job = categories.find(c => c.slug === currentFilters.jobSlug);
    return {
      title: `لیست بهترین ${job?.name || currentFilters.jobSlug}‌های ایران | مقایسه و رزرو آنلاین با آنتایم`,
      content: `آنتایم، بزرگترین سامانه نوبت‌دهی آنلاین ایران، لیست کاملی از بهترین ${job?.name || currentFilters.jobSlug}‌های کشور را گردآوری کرده است. هر کسب و کار در آنتایم یک صفحه اختصاصی دارد. مشتریان میتوانند با مراجعه به لینک اختصاصی، نوبت خود را ثبت کنند و پیامک تأیید و یادآوری دریافت نمایند. کسب و کارها نیز میتوانند به راحتی نوبت‌های خود را مدیریت کرده و دیگر نگران غیبت مشتریان نباشند.`
    };
  }
  
  if (currentFilters.serviceName) {
    return {
      title: `راهنمای انتخاب بهترین ارائه‌دهندگان خدمات ${currentFilters.serviceName} در ایران | آنتایم`,
      content: `به دنبال خدمات ${currentFilters.serviceName} هستید؟ آنتایم به شما کمک میکند بهترین ارائه‌دهندگان را پیدا کنید. آنتایم یک اپلیکیشن حرفه‌ای نوبت‌دهی است که به کسب و کارها صفحه اختصاصی میدهد. مشتریان میتوانند با لینک اختصاصی، آنلاین نوبت بگیرند و پیامک تأیید و یادآوری دریافت کنند. برای کسب و کارها نیز، آنتایم راهکاری ساده برای مدیریت نوبت‌ها و کاهش عدم حضور مشتریان است.`
    };
  }
  
  return {
    title: "آنتایم | اپلیکیشن حرفه‌ای نوبت‌دهی و مدیریت کسب و کار",
    content: "آنتایم یک اپلیکیشن هوشمند برای ثبت نوبت آنلاین، ارسال پیامک خودکار تأیید رزرو و یادآوری نوبت به مشتریان است. کسب و کارها میتوانند در آنتایم یک صفحه اختصاصی با لینک سفارشی بسازند و آن را در اختیار مشتریان خود قرار دهند. مشتریان با ورود به این لینک، بدون نیاز به تماس تلفنی، در کمترین زمان نوبت خود را ثبت میکنند و پیامک تأیید و یادآوری دریافت مینمایند. آنتایم راهکاری کامل برای حرفهای‌تر کردن کسب و کار شماست. همین حالا ثبت‌نام کنید و صفحه اختصاصی خود را بسازید!"
  };
}

// ==================== کامپوننت اصلی ====================
export default async function BusinessesPage({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const { sort = "visits", page = "1", q } = await searchParams;
  const currentPage = parseInt(page);
  
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  
  const { businesses, total, categories, cities, popularServices, currentFilters, isValidCombination, notFoundReason } = 
    await getBusinessesAndFilters(decodedSlug, sort, currentPage, q);
  
  const shouldShow404 = !isValidCombination && businesses.length === 0 && slug.length > 0 && !q;
  
  if (shouldShow404) {
    notFound();
  }
  
  const totalPages = Math.ceil(total / 12);
  const hasActiveFilters = slug.length > 0 || !!q;
  
  const getPageTitle = () => {
    if (q) return `🔍 نتایج جستجو: "${q}"`;
    if (currentFilters.city && currentFilters.jobSlug && currentFilters.serviceName) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `✨ خدمات ${currentFilters.serviceName} توسط ${job?.name || currentFilters.jobSlug}‌های ${currentFilters.city}`;
    }
    if (currentFilters.city && currentFilters.jobSlug) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `✨ بهترین ${job?.name || currentFilters.jobSlug}‌های ${currentFilters.city}`;
    }
    if (currentFilters.city && currentFilters.serviceName) {
      return `✨ ارائه‌دهندگان خدمات ${currentFilters.serviceName} در ${currentFilters.city}`;
    }
    if (currentFilters.jobSlug && currentFilters.serviceName) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `✨ ارائه‌دهندگان خدمات ${currentFilters.serviceName} (${job?.name || currentFilters.jobSlug})`;
    }
    if (currentFilters.city) return `✨ کسب و کارهای ${currentFilters.city}`;
    if (currentFilters.jobSlug) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `✨ لیست بهترین ${job?.name || currentFilters.jobSlug}‌های ایران`;
    }
    if (currentFilters.serviceName) return `✨ بهترین ارائه‌دهندگان خدمات ${currentFilters.serviceName} در ایران`;
    return "✨ لیست کسب و کارهای ثبت شده در اپلیکیشن آنتایم";
  };

  const getPageDescription = () => {
    if (total === 0) return "😕 هیچ کسب و کاری با این فیلترها یافت نشد. لطفاً فیلترهای دیگری را امتحان کنید یا عبارت جستجو را تغییر دهید.";
    if (q) return `🎯 نتایج عالی برای جستجوی "${q}" در آنتایم پیدا شد. بهترین کسب و کارها و خدمات مرتبط را مشاهده کنید. آدرس، شماره تماس و نظرات کاربران در دسترس شماست.`;
    if (currentFilters.city && currentFilters.jobSlug && currentFilters.serviceName) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `⭐ لیست ${job?.name || currentFilters.jobSlug}‌های حرفه‌ای در ${currentFilters.city} که خدمات ${currentFilters.serviceName} را با کیفیت بالا ارائه می‌دهند. آدرس، شماره تماس و نظرات کاربران را مقایسه کنید.`;
    }
    if (currentFilters.city && currentFilters.jobSlug) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `📍 لیست ${job?.name || currentFilters.jobSlug}‌های برتر در ${currentFilters.city} آماده ارائه خدمات حرفه‌ای به شما. مشاهده آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین نوبت.`;
    }
    if (currentFilters.city && currentFilters.serviceName) {
      return `🏢 لیست کسب و کارهای معتبر در ${currentFilters.city} که خدمات ${currentFilters.serviceName} را با بهترین کیفیت ارائه می‌دهند. مقایسه و انتخاب بهترین ارائه‌دهنده.`;
    }
    if (currentFilters.jobSlug && currentFilters.serviceName) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `✨ لیست ${job?.name || currentFilters.jobSlug}‌های حرفه‌ای که خدمات ${currentFilters.serviceName} را در سراسر ایران ارائه می‌دهند. مشاهده نظرات، امتیازات و رزرو آنلاین.`;
    }
    if (currentFilters.city) return `🌟 لیست کسب و کارهای برتر در ${currentFilters.city} آماده ارائه خدمات — مشاهده آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین. بهترین‌های ${currentFilters.city} را پیدا کنید.`;
    if (currentFilters.jobSlug) {
      const job = categories.find(c => c.slug === currentFilters.jobSlug);
      return `🔥 لیست ${job?.name || currentFilters.jobSlug}‌های حرفه‌ای در سراسر ایران — مقایسه، مشاهده نظرات و رزرو آنلاین نوبت. بهترین ${job?.name || currentFilters.jobSlug}‌های ایران را پیدا کنید.`;
    }
    if (currentFilters.serviceName) return `💎 لیست کسب و کارهای معتبر که خدمات ${currentFilters.serviceName} را با بهترین کیفیت ارائه می‌دهند — رزرو آنلاین و مشاهده نظرات کاربران.`;
    return `🎉 لیست کسب و کارهای برتر آماده ارائه خدمات حرفه‌ای در آنتایم — با ما بهترین‌ها را پیدا کنید. مشاهده آدرس، شماره تماس، نظرات کاربران و رزرو آنلاین نوبت.`;
  };

  const breadcrumbItems = buildBreadcrumbItems(slug, categories, currentFilters, q);
  const footerContent = getFooterContent(currentFilters, categories, total, q);
  
  // ساخت لینک‌های صفحه‌بندی برای هدهای سئو
  const getPaginationLinks = () => {
    const links = [];
    const baseUrl = buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, q);
    
    if (currentPage > 1) {
      links.push({ rel: "prev", href: buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, currentPage - 1, q) });
    }
    if (currentPage < totalPages) {
      links.push({ rel: "next", href: buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, currentPage + 1, q) });
    }
    return links;
  };
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": getPageTitle(),
    "description": getPageDescription(),
    "numberOfItems": total,
    "url": buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, currentPage, q),
    "itemListElement": businesses.map((business, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": business.business_name,
        "url": `https://ontime.app/c/${business.slug}`,
        "address": business.city ? {
          "@type": "PostalAddress",
          "addressLocality": business.city,
          "addressCountry": "IR"
        } : undefined,
        "aggregateRating": business.review_count > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": business.avg_rating,
          "reviewCount": business.review_count
        } : undefined,
        "image": business.avatar_image || business.cover_image,
        "telephone": business.phone,
        "priceRange": business.price_range
      }
    }))
  };
  
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": `https://ontime.app${item.url}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* لینک‌های صفحه‌بندی سئو */}
      {getPaginationLinks().map((link, idx) => (
        <link key={idx} rel={link.rel} href={link.href} />
      ))}
      
      <Navigation/>
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rtl">
        {/* هدر */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
            {/* Breadcrumb */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex items-center gap-2 text-sm text-emerald-100/80 whitespace-nowrap">
                {breadcrumbItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <span>/</span>}
                    <Link href={item.url} className="hover:text-white transition">
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-sm mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>بیش از {total.toLocaleString()} کسب و کار فعال</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent leading-tight">
                {getPageTitle()}
              </h1>
              <p className="text-emerald-100 text-lg md:text-xl mb-8 max-w-3xl">
                {getPageDescription()}
              </p>
              
              <div className="max-w-2xl mx-auto md:mx-0">
                <form action="/businesses" method="GET" className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q || ""}
                    placeholder="جستجوی کسب و کار، خدمات حرفه‌ای یا برند مورد نظر..."
                    className="w-full px-6 py-5 pr-14 text-gray-900 bg-white rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-right text-base"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-emerald-600 transition-all duration-300 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {q && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, undefined)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Link>
                  )}
                </form>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
              <path fill="currentColor" fillOpacity="0.05" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              <path fill="currentColor" fillOpacity="0.1" d="M0,96L80,101.3C160,107,320,117,480,112C640,107,800,85,960,80C1120,75,1280,85,1360,90.7L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* سایدبار */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sticky top-24 border border-white/20 dark:border-slate-700/50 transition-all duration-300 hover:shadow-3xl">
                
                {hasActiveFilters && (
                  <div className="mb-6 pb-5 border-b border-gray-200 dark:border-gray-700">
                    <Link
                      href="/businesses"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      حذف همه فیلترها
                    </Link>
                  </div>
                )}
                
                {/* دسته بندی مشاغل - H2 اضافه شد */}
                <div className="mb-8">
                  <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                    دسته‌بندی مشاغل
                  </h2>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    <Link
                      href={buildBusinessUrl(undefined, undefined, undefined, sort, 1, q)}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                        !currentFilters.city && !currentFilters.jobSlug && !currentFilters.serviceName && !q
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm" 
                          : "hover:bg-gray-100 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <span>همه دسته‌ها</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{total.toLocaleString()}</span>
                    </Link>
                    {categories.map((cat) => {
                      const isActive = currentFilters.jobSlug === cat.slug && !currentFilters.city && !currentFilters.serviceName;
                      return (
                        <Link
                          key={cat.id}
                          href={buildBusinessUrl(undefined, cat.slug, undefined, sort, 1, q)}
                          className={`flex justify-between items-center px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                            isActive 
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm" 
                              : "hover:bg-gray-100 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{cat.business_count.toLocaleString()}</span>
                        </Link>
                      );
                    })}
                  </div>
                  {/* لینک دیدن همه دسته‌بندی‌ها */}
                  <Link href="/categories" className="inline-block mt-4 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    مشاهده همه دسته‌بندی‌ها →
                  </Link>
                </div>
                
                {/* شهرها - H2 اضافه شد */}
                <div className="mb-8">
                  <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                    شهرهای پربازدید
                  </h2>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    <Link
                      href={buildBusinessUrl(undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, q)}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                        !currentFilters.city
                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <span>همه شهرها</span>
                    </Link>
                    {cities.map((c) => {
                      const isActive = currentFilters.city === c.city;
                      return (
                        <Link
                          key={c.city}
                          href={buildBusinessUrl(c.city, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, q)}
                          className={`flex justify-between items-center px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                            isActive 
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-semibold" 
                              : "hover:bg-gray-100 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <span>📍 {c.city}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{c.business_count.toLocaleString()}</span>
                        </Link>
                      );
                    })}
                  </div>
                  {/* لینک دیدن همه شهرها */}
                  <Link href="/cities" className="inline-block mt-4 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    مشاهده همه شهرها →
                  </Link>
                </div>
                
                {/* خدمات محبوب - H2 اضافه شد */}
                {popularServices.length > 0 && (
                  <div>
                    <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                      <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                      خدمات محبوب
                    </h2>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {popularServices.slice(0, 8).map((s) => {
                        const isActive = currentFilters.serviceName === s.name;
                        return (
                          <Link
                            key={s.name}
                            href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, isActive ? undefined : s.name, sort, 1, q)}
                            className={`flex justify-between items-center px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                              isActive 
                                ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-semibold" 
                                : "hover:bg-gray-100 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            <span>⭐ {s.name}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{s.business_count.toLocaleString()}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
            
            <main className="flex-1">
              {!isValidCombination && businesses.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-r-4 border-amber-500 rounded-xl backdrop-blur-sm">
                  <p className="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span> {notFoundReason || "برخی از فیلترهای انتخاب شده معتبر نیستند و نادیده گرفته شدند."}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  نمایش <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{total.toLocaleString()}</span> نتیجه
                  {q && <span className="text-emerald-600 dark:text-emerald-400"> برای "{q}"</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "visits", label: "🔥 پربازدیدترین" },
                    { key: "rating", label: "⭐ بالاترین امتیاز" },
                    { key: "newest", label: "🆕 جدیدترین" }
                  ].map((item) => (
                    <Link
                      key={item.key}
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, item.key, 1, q)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        sort === item.key 
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105" 
                          : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-md border border-gray-200 dark:border-slate-700 hover:scale-105"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2.5 mb-8">
                  {q && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, undefined)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <span>🔍</span> جستجو: {q}
                      <span className="text-base font-bold mr-1">✕</span>
                    </Link>
                  )}
                  {currentFilters.city && (
                    <Link
                      href={buildBusinessUrl(undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, q)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <span>📍</span> شهر: {currentFilters.city}
                      <span className="text-base font-bold">✕</span>
                    </Link>
                  )}
                  {currentFilters.jobSlug && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, undefined, currentFilters.serviceSlug || undefined, sort, 1, q)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <span>💼</span> شغل: {categories.find(c => c.slug === currentFilters.jobSlug)?.name || currentFilters.jobSlug}
                      <span className="text-base font-bold">✕</span>
                    </Link>
                  )}
                  {currentFilters.serviceName && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, undefined, sort, 1, q)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-700 dark:text-orange-400 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <span>✨</span> سرویس: {currentFilters.serviceName}
                      <span className="text-base font-bold">✕</span>
                    </Link>
                  )}
                </div>
              )}
              
              {businesses.length === 0 ? (
                <div className="text-center py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl">
                  <div className="text-8xl mb-6 animate-bounce">🔍</div>
                  <h2 className="font-bold text-gray-800 dark:text-white text-2xl mb-3">هیچ کسب و کاری یافت نشد</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                    {slug.length > 0 
                      ? `هیچ کسب و کاری با این ترکیب در ${currentFilters.city || ''} ${currentFilters.jobSlug || ''} ${currentFilters.serviceName || ''} یافت نشد.`
                      : 'فیلترهای دیگری را امتحان کنید یا عبارت جستجو را تغییر دهید'
                    }
                  </p>
                  <div className="flex gap-4 justify-center mt-8 flex-wrap">
                    <Link href="/businesses" className="inline-block px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      مشاهده همه کسب و کارها
                    </Link>
                    {currentFilters.city && (
                      <Link href={buildBusinessUrl(undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, 1, q)} className="inline-block px-8 py-3.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                        حذف فیلتر شهر
                      </Link>
                    )}
                    {currentFilters.jobSlug && (
                      <Link href={buildBusinessUrl(currentFilters.city || undefined, undefined, currentFilters.serviceSlug || undefined, sort, 1, q)} className="inline-block px-8 py-3.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                        حذف فیلتر شغل
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
                    {businesses.map((business, index) => (
                      <Link
                        key={business.slug}
                        href={`/c/${business.slug}`}
                        className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-slate-700"
                      >
                        <div className="relative h-44 bg-gradient-to-r from-emerald-500 to-teal-500 overflow-hidden">
                          {business.cover_image ? (
                            <Image 
                              src={business.cover_image} 
                              alt={`کاور ${business.business_name} - ${business.job_name || 'کسب و کار'} در ${business.city || 'ایران'} | آنتایم`}
                              width={400}
                              height={176}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600">
                              <span className="text-7xl opacity-80">🏢</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold">
                            {business.job_name || "کسب و کار"}
                          </div>
                          {business.total_visits > 0 && (
                            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-[11px] font-medium">
                              👁️ {business.total_visits.toLocaleString()} بازدید
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 shadow-lg ring-2 ring-white dark:ring-slate-700">
                              {business.avatar_image ? (
                                <Image 
                                  src={business.avatar_image} 
                                  alt={`لوگوی ${business.business_name} - ${business.job_name || 'کسب و کار'} در ${business.city || 'ایران'} | آنتایم`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                  {business.business_name?.charAt(0) || "🏢"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1 text-lg">
                                {business.business_name}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {business.city || business.province || "ایران"}
                              </p>
                              {business.review_count > 0 && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(business.avg_rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({business.review_count.toLocaleString()} نظر)</span>
                                </div>
                              )}
                              {business.services?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {business.services.slice(0, 2).map((s: any) => (
                                    <span key={s.id} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate max-w-[90px]">
                                      {s.name}
                                    </span>
                                  ))}
                                  {business.services.length > 2 && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-medium text-gray-500">
                                      +{business.services.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* محتوای متنی پایین صفحه برای سئو */}
                  <div className="mt-12 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      {footerContent.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {footerContent.content}
                    </p>
                  </div>
                </>
              )}
              
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, currentPage - 1, q)}
                      className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-slate-700"
                    >
                      ← قبلی
                    </Link>
                  )}
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <Link
                          key={pageNum}
                          href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, pageNum, q)}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 ${
                            currentPage === pageNum 
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-110" 
                              : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-lg border border-gray-200 dark:border-slate-700 hover:scale-105"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                  {currentPage < totalPages && (
                    <Link
                      href={buildBusinessUrl(currentFilters.city || undefined, currentFilters.jobSlug || undefined, currentFilters.serviceSlug || undefined, sort, currentPage + 1, q)}
                      className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-slate-700"
                    >
                      بعدی →
                    </Link>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
        {/* بنر دعوت به ثبت کسب و کار */}
<div className="mt-12 max-w-7xl m-auto my-30">
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl">
    {/* افکت‌های پس‌زمینه */}
   <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/30 rounded-full blur-3xl"></div>
    
    {/* محتوای بنر */}
    <div className="relative p-6 md:p-8 text-center md:text-right">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* راست: متن */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 text-sm mb-4">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
            <span className="text-white/90">فرصت ویژه برای کسب و کارها</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            ✨ کسب و کار خود را در آنتایم ثبت کنید
          </h3>
          <p className="text-emerald-100 text-base md:text-lg mb-4 max-w-2xl">
            با ثبت نام در اپلیکیشن نوبت دهی آنتایم، یک صفحه اختصاصی و حرفه‌ای برای کسب و کار خود دریافت کنید. 
            مشتریان شما میتوانند به راحتی نوبت بگیرند، پیامک یادآوری دریافت کنند و شما هم همه چیز را مدیریت کنید.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>صفحه اختصاصی با لینک سفارشی</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>نوبت‌دهی آنلاین ۲۴ ساعته</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>پیامک خودکار تأیید و یادآوری</span>
            </div>
          </div>
        </div>
        
        {/* چپ: دکمه و آیکون */}
        <div className="flex-shrink-0 text-center">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <svg className="w-10 h-10 md:w-14 md:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <Link
            href="../"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-emerald-700 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <span>همین حالا ثبت‌نام کنید</span>
            <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
          <p className="text-emerald-200 text-xs mt-3">
            * ثبت‌نام رایگان • پشتیبانی ۲۴ ساعته
          </p>
        </div>
      </div>
    </div>
    
    {/* دکوراسیون پایین بنر */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/20 via-white to-white/20"></div>
  </div>
</div>
        <EnhancedFooter/>
      </div>
    </>
  );
}