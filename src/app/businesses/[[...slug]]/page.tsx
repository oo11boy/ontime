// src/app/businesses/[[...slug]]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { query } from "@/lib/db";

function decodeSlug(encodedSlug: string): string {
  try {
    return decodeURIComponent(encodedSlug);
  } catch {
    return encodedSlug;
  }
}

type Props = {
  params: Promise<{ slug?: string[] }>;  // توجه: slug می‌تواند undefined باشد
  searchParams: Promise<{ sort?: string; page?: string; service?: string }>;
};

// ==================== تابع دریافت اطلاعات ====================
async function getBusinessesAndFilters(
  slug: string[] = [], 
  sort: string = "visits", 
  page: number = 1,
  serviceFilter?: string
) {
  const limit = 12;
  const offset = (page - 1) * limit;
  
  let city: string | null = null;
  let categorySlug: string | null = null;
  let categoryId: number | null = null;
  
  // اگر slug وجود داشت، پردازش کن (حالا می‌تواند خالی هم باشد)
  if (slug && slug.length > 0) {
    const decodedSlug = slug.map(s => decodeSlug(s));
    
    if (decodedSlug.length === 1) {
      // بررسی می‌کنیم که slug اول شهر است یا دسته
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
  
  // بقیه کوئری‌ها مثل قبل...
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
  
  // دریافت لیست دسته‌ها، شهرها و خدمات (مثل قبل)
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
    currentFilters: { city, categorySlug, categoryId, serviceFilter }
  };
}

// ==================== متادیتا ====================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug = [] } = await params;  // اگر slug undefined باشه، تبدیل به [] میشه
  const { service } = await searchParams;
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  const [city, categorySlug] = decodedSlug;
  
  let title = "لیست کسب و کارهای ایران | آنتایم";
  let description = "بهترین کسب و کارهای ایران را پیدا کنید و نوبت بگیرید";
  
  if (service) {
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
  const { slug = [] } = await params;  // اگر undefined باشه، تبدیل به [] میشه
  const { sort = "visits", page = "1", service } = await searchParams;
  const currentPage = parseInt(page);
  
  const decodedSlug = slug.map(s => decodeURIComponent(s));
  
  const { businesses, total, categories, cities, popularServices } = 
    await getBusinessesAndFilters(decodedSlug, sort, currentPage, service);
  
  // فقط اگر slug وجود داشت و کسب و کاری پیدا نشد، 404 برگردون
  if (businesses.length === 0 && slug.length > 0 && !service) {
    notFound();
  }
  
  const totalPages = Math.ceil(total / 12);
  const hasActiveFilters = slug.length > 0 || !!service;
  
  const encodeUrlPart = (part: string) => encodeURIComponent(part);
  
  const buildUrl = (newSlug: string[], newSort?: string, newPage?: number, newService?: string) => {
    let url = `/businesses${newSlug.length ? `/${newSlug.map(s => encodeUrlPart(s)).join("/")}` : ""}`;
    const queryParams = new URLSearchParams();
    if (newSort && newSort !== "visits") queryParams.set("sort", newSort);
    if (newPage && newPage > 1) queryParams.set("page", newPage.toString());
    if (newService) queryParams.set("service", newService);
    const queryString = queryParams.toString();
    return `${url}${queryString ? `?${queryString}` : ""}`;
  };
  
  const getPageTitle = () => {
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
    return "✨ لیست کسب و کارهای ایران";
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{getPageTitle()}</h1>
          <p className="text-emerald-100 text-lg mb-2">
            {total.toLocaleString()} کسب و کار برتر
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 sticky top-20">
              
              {/* حذف همه فیلترها */}
              {hasActiveFilters && (
                <div className="mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    href="/businesses"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    حذف همه فیلترها
                  </Link>
                </div>
              )}
              
              {/* فیلتر دسته شغلی */}
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">دسته‌بندی مشاغل</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
                <Link
                  href={buildUrl([], sort, 1, service)}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    decodedSlug.length === 0 && !service ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  همه دسته‌ها
                </Link>
                {categories.map((cat) => {
                  const isActive = decodedSlug.length === 1 && decodedSlug[0] === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={buildUrl([cat.slug], sort, 1, service)}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition ${
                        isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.business_count}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* فیلتر شهر */}
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">شهرهای پربازدید</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                <Link
                  href={buildUrl([], sort, 1, service)}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${
                    decodedSlug.length === 0 ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  همه شهرها
                </Link>
                {cities.map((c) => {
                  const isActive = decodedSlug.length === 1 && decodedSlug[0] === c.city;
                  return (
                    <Link
                      key={c.city}
                      href={buildUrl([c.city], sort, 1, service)}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition ${
                        isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>{c.city}</span>
                      <span className="text-xs text-gray-400">{c.business_count}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* فیلتر خدمات */}
              {popularServices.length > 0 && (
                <>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">خدمات محبوب</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {popularServices.map((s) => {
                      const isActive = service === s.name;
                      return (
                        <Link
                          key={s.name}
                          href={buildUrl(decodedSlug, sort, 1, isActive ? undefined : s.name)}
                          className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition ${
                            isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>✂️ {s.name}</span>
                          <span className="text-xs text-gray-400">{s.business_count}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* مرتب‌سازی و نتایج */}
            <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{total.toLocaleString()}</span> کسب و کار
              </p>
              <div className="flex gap-2">
                <Link href={buildUrl(decodedSlug, "visits", 1, service)} className={`px-3 py-1.5 rounded-lg text-sm transition ${sort === "visits" ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>پربازدیدترین</Link>
                <Link href={buildUrl(decodedSlug, "rating", 1, service)} className={`px-3 py-1.5 rounded-lg text-sm transition ${sort === "rating" ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>بالاترین امتیاز</Link>
                <Link href={buildUrl(decodedSlug, "newest", 1, service)} className={`px-3 py-1.5 rounded-lg text-sm transition ${sort === "newest" ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>جدیدترین</Link>
              </div>
            </div>
            
            {/* فیلترهای فعال */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {service && (
                  <Link
                    href={buildUrl(decodedSlug, sort, 1, undefined)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm hover:bg-emerald-200 transition"
                  >
                    خدمات: {service}
                    <span className="text-xs">✕</span>
                  </Link>
                )}
                {decodedSlug.map((s, i) => {
                  let label = s;
                  if (i === 1) {
                    const cat = categories.find(c => c.slug === s);
                    if (cat) label = cat.name;
                  }
                  const newSlug = decodedSlug.filter((_, idx) => idx !== i);
                  return (
                    <Link
                      key={i}
                      href={buildUrl(newSlug, sort, 1, service)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm hover:bg-emerald-200 transition"
                    >
                      {label}
                      <span className="text-xs">✕</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* کارت‌های کسب و کار */}
            {businesses.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">هیچ کسب و کاری یافت نشد</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">فیلترهای دیگری را امتحان کنید</p>
                <Link href="/businesses" className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
                  مشاهده همه کسب و کارها
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {businesses.map((business) => (
                  <Link
                    key={business.slug}
                    href={`/c/${business.slug}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
                  >
                    <div className="relative h-32 bg-gradient-to-r from-emerald-500 to-teal-500">
                      {business.cover_image && (
                        <img src={business.cover_image} alt={business.business_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs">
                        {business.job_name || "کسب و کار"}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {business.avatar_image ? (
                            <img src={business.avatar_image} alt={business.business_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold">
                              {business.business_name?.charAt(0) || "🏢"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-bold text-gray-800 dark:text-white group-hover:text-emerald-600 transition line-clamp-1">
                            {business.business_name}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {business.city || business.province || "ایران"}
                          </p>
                          {business.review_count > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(business.avg_rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({business.review_count.toLocaleString()})</span>
                            </div>
                          )}
                          {business.services?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {business.services.slice(0, 2).map((s: any) => (
                                <span key={s.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[80px]">
                                  {s.name}
                                </span>
                              ))}
                              {business.services.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] text-gray-500">
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <Link href={buildUrl(decodedSlug, sort, currentPage - 1, service)} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    قبلی
                  </Link>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <Link
                        key={pageNum}
                        href={buildUrl(decodedSlug, sort, pageNum, service)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
                          currentPage === pageNum 
                            ? "bg-emerald-600 text-white" 
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={buildUrl(decodedSlug, sort, currentPage + 1, service)} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    بعدی
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}