// src/app/businesses/[[...slug]]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  searchParams: Promise<{ sort?: string; page?: string; service?: string; q?: string }>;
};

// ==================== تابع دریافت اطلاعات با قابلیت سرچ ====================
async function getBusinessesAndFilters(
  slug: string[] = [], 
  sort: string = "visits", 
  page: number = 1,
  serviceFilter?: string,
  searchQuery?: string
) {
  const limit = 12;
  const offset = (page - 1) * limit;
  
  let city: string | null = null;
  let categorySlug: string | null = null;
  let categoryId: number | null = null;
  
  // پردازش slug
  if (slug && slug.length > 0) {
    const decodedSlug = slug.map(s => decodeSlug(s));
    
    if (decodedSlug.length === 1) {
      const cityCheck = await query<any>(
        "SELECT city FROM customer_links WHERE city = ? LIMIT 1", 
        [decodedSlug[0]]
      );
      if (cityCheck && cityCheck.length > 0) {
        city = decodedSlug[0];
      } else {
        categorySlug = decodedSlug[0];
        const job = await query<any>("SELECT id FROM jobs WHERE english_name = ?", [categorySlug]);
        if (job && job.length > 0) categoryId = job[0].id;
      }
    } else if (decodedSlug.length === 2) {
      city = decodedSlug[0];
      categorySlug = decodedSlug[1];
      const job = await query<any>("SELECT id FROM jobs WHERE english_name = ?", [categorySlug]);
      if (job && job.length > 0) categoryId = job[0].id;
    }
  }
  
  // ساخت شرط‌ها
  let conditions = ["cl.is_active = 1", "cl.is_deleted = 0"];
  const params: any[] = [];
  
  if (city) {
    conditions.push("cl.city = ?");
    params.push(city);
  }
  
  if (categoryId) {
    conditions.push("u.job_id = ?");
    params.push(categoryId);
  }
  
  if (serviceFilter) {
    conditions.push(`JSON_SEARCH(cl.services, 'one', ?, NULL, '$[*].name') IS NOT NULL`);
    params.push(serviceFilter);
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
  
  // دریافت دسته‌بندی‌ها
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
  
  // دریافت شهرها
  const cities = await query<any>(
    `SELECT city, COUNT(*) as business_count
    FROM customer_links
    WHERE is_active = 1 AND is_deleted = 0 AND city IS NOT NULL AND city != ''
    GROUP BY city
    HAVING business_count > 0
    ORDER BY business_count DESC
    LIMIT 20`
  );
  
  // دریافت خدمات محبوب
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
    currentFilters: { city, categorySlug, categoryId, serviceFilter, searchQuery }
  };
}

// ==================== متادیتا ====================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const { service, q } = await searchParams;
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  const [city, categorySlug] = decodedSlug;
  
  let title = "لیست کسب و کارهای ایران | آنتایم";
  let description = "بهترین کسب و کارهای ایران را پیدا کنید و نوبت بگیرید";
  
  if (q) {
    title = `نتایج جستجوی "${q}" | آنتایم`;
    description = `نتایج جستجوی ${q} در آنتایم`;
  } else if (service) {
    title = `بهترین ارائه‌دهندگان خدمات ${service} | آنتایم`;
  } else if (categorySlug) {
    const job = await query<any>("SELECT persian_name FROM jobs WHERE english_name = ?", [categorySlug]);
    const jobName = job?.[0]?.persian_name || categorySlug;
    if (city) {
      title = `بهترین ${jobName}‌های ${city} | آنتایم`;
    } else {
      title = `لیست بهترین ${jobName}‌های ایران | آنتایم`;
    }
  } else if (city) {
    title = `لیست کسب و کارهای ${city} | آنتایم`;
  }
  
  return { title, description };
}

// ==================== کامپوننت اصلی ====================
export default async function BusinessesPage({ params, searchParams }: Props) {
  const { slug = [] } = await params;
  const { sort = "visits", page = "1", service, q } = await searchParams;
  const currentPage = parseInt(page);
  
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  
  const { businesses, total, categories, cities, popularServices } = 
    await getBusinessesAndFilters(decodedSlug, sort, currentPage, service, q);
  
  if (businesses.length === 0 && slug.length > 0 && !service && !q) {
    notFound();
  }
  
  const totalPages = Math.ceil(total / 12);
  const hasActiveFilters = slug.length > 0 || !!service || !!q;
  
  const encodeUrlPart = (part: string) => encodeURIComponent(part);
  
  const buildUrl = (newSlug: string[], newSort?: string, newPage?: number, newService?: string, newQuery?: string) => {
    let url = `/businesses${newSlug.length ? `/${newSlug.map(s => encodeUrlPart(s)).join("/")}` : ""}`;
    const queryParams = new URLSearchParams();
    if (newSort && newSort !== "visits") queryParams.set("sort", newSort);
    if (newPage && newPage > 1) queryParams.set("page", newPage.toString());
    if (newService) queryParams.set("service", newService);
    if (newQuery) queryParams.set("q", newQuery);
    const queryString = queryParams.toString();
    return `${url}${queryString ? `?${queryString}` : ""}`;
  };
  
  const getPageTitle = () => {
    if (q) return `🔍 نتایج جستجو: "${q}"`;
    if (service) return `✨ خدمات ${service}`;
    if (decodedSlug.length === 2) {
      const category = categories.find(c => c.slug === decodedSlug[1]);
      return `✨ بهترین ${category?.name || decodedSlug[1]}‌های ${decodedSlug[0]}`;
    }
    if (decodedSlug.length === 1) {
      const category = categories.find(c => c.slug === decodedSlug[0]);
      if (category) return `✨ لیست بهترین ${category.name}‌های ایران`;
      return `✨ کسب و کارهای ${decodedSlug[0]}`;
    }
    return "✨ لیست کسب و کارهای ثبت شده در اپلیکیشن آنتایم";
  };
  
  return (
    <>
        <Navigation/>
            <div className="min-h-screen mt-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rtl">

      {/* Header با طراحی مدرن */}
      <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl mb-6">
              {total.toLocaleString()} کسب و کار برتر آماده ارائه خدمات
            </p>
            
            {/* باکس جستجو (سرچ) - مدرن و زیبا */}
            <div className="max-w-2xl mx-auto md:mx-0">
              <form action="/businesses" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q || ""}
                  placeholder="جستجوی کسب و کار، خدمات یا برند..."
                  className="w-full px-6 py-4 pr-14 text-gray-900 bg-white rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all text-right"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {q && (
                  <Link
                    href="/businesses"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar با طراحی مدرن */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-20 border border-gray-200/50 dark:border-gray-700/50">
              
              {hasActiveFilters && (
                <div className="mb-6 pb-5 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    href="/businesses"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-pink-600 transition shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    حذف همه فیلترها
                  </Link>
                </div>
              )}
              
              {/* دسته بندی مشاغل */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                  دسته‌بندی مشاغل
                </h3>
                <div className="space-y-1 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  <Link
                    href={buildUrl([], sort, 1, service, q)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      decodedSlug.length === 0 && !service && !q 
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span>همه دسته‌ها</span>
                    <span className="text-xs text-gray-400">{total}</span>
                  </Link>
                  {categories.map((cat) => {
                    const isActive = decodedSlug.length === 1 && decodedSlug[0] === cat.slug;
                    return (
                      <Link
                        key={cat.id}
                        href={buildUrl([cat.slug], sort, 1, service, q)}
                        className={`flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive 
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-medium shadow-sm" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat.business_count.toLocaleString()}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* شهرها */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                  شهرهای پربازدید
                </h3>
                <div className="space-y-1 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  <Link
                    href={buildUrl([], sort, 1, service, q)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                      decodedSlug.length === 0 && !service && !q
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span>همه شهرها</span>
                  </Link>
                  {cities.map((c) => {
                    const isActive = decodedSlug.length === 1 && decodedSlug[0] === c.city;
                    return (
                      <Link
                        key={c.city}
                        href={buildUrl([c.city], sort, 1, service, q)}
                        className={`flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive 
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-medium" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <span>📍 {c.city}</span>
                        <span className="text-xs text-gray-400">{c.business_count.toLocaleString()}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* خدمات محبوب */}
              {popularServices.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                    خدمات محبوب
                  </h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {popularServices.slice(0, 8).map((s) => {
                      const isActive = service === s.name;
                      return (
                        <Link
                          key={s.name}
                          href={buildUrl(decodedSlug, sort, 1, isActive ? undefined : s.name, q)}
                          className={`flex justify-between items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
                            isActive 
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 font-medium" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <span>⭐ {s.name}</span>
                          <span className="text-xs text-gray-400">{s.business_count.toLocaleString()}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* مرتب‌سازی */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                نمایش <span className="font-bold text-emerald-600 dark:text-emerald-400">{total.toLocaleString()}</span> نتیجه
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
                    href={buildUrl(decodedSlug, item.key, 1, service, q)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      sort === item.key 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" 
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* فیلترهای فعال */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {q && (
                  <Link
                    href={buildUrl(decodedSlug, sort, 1, service, undefined)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm hover:shadow-md transition"
                  >
                    🔍 جستجو: {q}
                    <span className="text-xs font-bold">✕</span>
                  </Link>
                )}
                {service && (
                  <Link
                    href={buildUrl(decodedSlug, sort, 1, undefined, q)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-400 rounded-xl text-sm hover:shadow-md transition"
                  >
                    ✂️ خدمات: {service}
                    <span className="text-xs font-bold">✕</span>
                  </Link>
                )}
                {decodedSlug.map((s, i) => {
                  let label = s;
                  if (i === 0 && categories.find(c => c.slug === s)) {
                    label = categories.find(c => c.slug === s)?.name || s;
                  }
                  if (i === 1) {
                    const cat = categories.find(c => c.slug === s);
                    if (cat) label = cat.name;
                  }
                  const newSlug = decodedSlug.filter((_, idx) => idx !== i);
                  return (
                    <Link
                      key={i}
                      href={buildUrl(newSlug, sort, 1, service, q)}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-400 rounded-xl text-sm hover:shadow-md transition"
                    >
                      📍 {label}
                      <span className="text-xs font-bold">✕</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* کارت‌های کسب و کار با طراحی مدرن */}
            {businesses.length === 0 ? (
              <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-800 dark:text-white text-xl">هیچ کسب و کاری یافت نشد</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">فیلترهای دیگری را امتحان کنید یا عبارت جستجو را تغییر دهید</p>
                <Link href="/businesses" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition">
                  مشاهده همه کسب و کارها
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <Link
                    key={business.slug}
                    href={`/c/${business.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-teal-500 overflow-hidden">
                      {business.cover_image ? (
                        <img 
                          src={business.cover_image} 
                          alt={business.business_name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600">
                          <span className="text-6xl">🏢</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                        {business.job_name || "کسب و کار"}
                      </div>
                      {business.total_visits > 0 && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-[10px]">
                          👁️ {business.total_visits.toLocaleString()} بازدید
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 shadow-md">
                          {business.avatar_image ? (
                            <img src={business.avatar_image} alt={business.business_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                              {business.business_name?.charAt(0) || "🏢"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1 text-lg">
                            {business.business_name}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {business.city || business.province || "ایران"}
                          </p>
                          {business.review_count > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(business.avg_rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({business.review_count.toLocaleString()})</span>
                            </div>
                          )}
                          {business.services?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {business.services.slice(0, 2).map((s: any) => (
                                <span key={s.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[90px]">
                                  {s.name}
                                </span>
                              ))}
                              {business.services.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] text-gray-500">
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
            )}
            
            {/* Pagination با طراحی مدرن */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {currentPage > 1 && (
                  <Link
                    href={buildUrl(decodedSlug, sort, currentPage - 1, service, q)}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
                  >
                    ← قبلی
                  </Link>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl(decodedSlug, sort, pageNum, service, q)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                          currentPage === pageNum 
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" 
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link
                    href={buildUrl(decodedSlug, sort, currentPage + 1, service, q)}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition border border-gray-200 dark:border-gray-700"
                  >
                    بعدی →
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <EnhancedFooter/>
    </div>
    </>

  );
}