// app/industries/custom-booking-page/components/CustomBookingLiveSamples.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Briefcase, ExternalLink, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface Business {
  business_name: string;
  province: string;
  city: string;
  address: string;
  avatar: string | null;
  cover: string | null;
  services: any[];
  bio: string | null;
  slug: string;
  page_url: string;
  total_visits: number;
  job: {
    id: number;
    name: string;
    slug: string;
  };
  stats: {
    review_count: number;
    avg_rating: number;
  };
}

export default function CustomBookingLiveSamples() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/public/businesses?limit=30&orderBy=total_visits');
        const result = await response.json();
        
        // داده‌ها در result.data قرار دارند
        if (result.success && Array.isArray(result.data)) {
          setBusinesses(result.data);
        } else if (Array.isArray(result)) {
          setBusinesses(result);
        } else {
          console.warn("فرمت داده نامعتبر:", result);
        }
      } catch (error) {
        console.error("خطا در دریافت کسب‌وکارها:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  // فیلتر کسب‌وکارهایی که حداقل اطلاعات دارند
  const validBusinesses = businesses.filter(b => b.business_name && b.slug);
  
  const paginatedBusinesses = validBusinesses.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(validBusinesses.length / itemsPerPage);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black mb-4">
              🔥 کسب‌وکارهای فعال
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900">
              صفحاتی که با آنتایم ساخته شده‌اند
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                <div className="h-36 bg-slate-200"></div>
                <div className="p-4 pt-8">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (validBusinesses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black mb-4">
            🔥 کسب‌وکارهای فعال
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900">
            صفحاتی که با آنتایم ساخته شده‌اند
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            نمونه‌هایی از کسب‌وکار هایی که در آنتایم صفحه اختصاصی خود را ساخته‌اند:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {paginatedBusinesses.map((business) => (
            <Link
              key={business.slug}
              href={business.page_url || `/c/${business.slug}`}
              target="_blank"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100"
            >
              {/* کاور تصویر */}
              <div className="relative h-36 bg-gradient-to-r from-blue-600 to-pink-600">
                {business.cover ? (
                  <Image
                    src={business.cover}
                    alt={business.business_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 font-black text-4xl">
                    {business.business_name?.charAt(0)}
                  </div>
                )}
                {/* آواتار */}
                <div className="absolute -bottom-6 right-4">
                  <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-lg">
                    {business.avatar ? (
                      <Image
                        src={business.avatar}
                        alt={business.business_name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-pink-600 flex items-center justify-center text-white font-black text-lg">
                        {business.business_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* محتوای کارت */}
              <div className="p-4 pt-8">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-black text-slate-800 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                    {business.business_name}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-slate-700">
                      {business.stats?.avg_rating?.toFixed(1) || "جدید"}
                    </span>
                  </div>
                </div>

                {/* دسته‌بندی */}
                <div className="flex items-center gap-1 text-slate-500 text-[10px] mb-2">
                  <Briefcase size={10} />
                  <span>{business.job?.name || "کسب و کار"}</span>
                </div>

                {/* موقعیت */}
                <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-3">
                  <MapPin size={10} />
                  <span>{business.city || business.province || "ایران"}</span>
                </div>

                {/* توضیحات */}
                <p className="text-slate-500 text-[11px] line-clamp-2 mb-3">
                  {business.bio || "برای مشاهده خدمات و دریافت نوبت کلیک کنید"}
                </p>

                {/* آمار */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <span>👁️ {business.total_visits?.toLocaleString() || 0}</span>
                    <span>📝 {business.stats?.review_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold group-hover:gap-2 transition-all">
                    <span>مشاهده صفحه</span>
                    <ExternalLink size={10} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-[11px] sm:text-xs">
            و هزاران کسب‌وکار دیگر در سراسر ایران...
          </p>
        </div>
        <Link 
  href="/businesses" 
  className="flex items-center justify-center gap-2 w-full sm:w-auto mx-auto mt-8 md:mt-10 px-6 md:px-8 py-3 md:py-4 bg-white border-2 border-blue-200 rounded-xl md:rounded-2xl text-blue-600 font-black text-sm md:text-base hover:bg-blue-50 hover:border-blue-300 hover:gap-3 transition-all duration-300 group"
>
  <span>مشاهده لیست کامل کسب‌وکارها</span>
  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
</Link>
      </div>
    </section>
  );
}