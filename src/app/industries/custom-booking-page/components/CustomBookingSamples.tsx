// app/industries/custom-booking-page/components/CustomBookingSamples.tsx
"use client";

import { ExternalLink, Star, Image as ImageIcon, Scissors, Stethoscope, Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";

const samples = [
  {
    title: "آرایشگاه و سالن زیبایی",
    icon: <Scissors className="text-pink-500" size={24} />,
    bgGradient: "from-pink-50 to-rose-50",
    link: "/industries/beauty-salon",
    features: ["گالری مدل مو", "لیست قیمت خدمات", "نظرات مشتریان"],
    rating: 4.9,
    reviews: 124
  },
  {
    title: "ناخن کار و کاشت ناخن",
    icon: <Sparkles className="text-rose-500" size={24} />,
    bgGradient: "from-rose-50 to-pink-50",
    link: "/industries/nail-artist",
    features: ["گالری کاشت ناخن", "یادآوری ترمیم", "رزرو آنلاین"],
    rating: 4.8,
    reviews: 89
  },
  {
    title: "پزشکان و کلینیک‌ها",
    icon: <Stethoscope className="text-blue-500" size={24} />,
    bgGradient: "from-blue-50 to-indigo-50",
    link: "/industries/doctors",
    features: ["نوبت دهی آنلاین", "پیامک یادآوری", "پرونده بیمار"],
    rating: 4.9,
    reviews: 98
  },
  {
    title: "باشگاه‌های ورزشی",
    icon: <Dumbbell className="text-emerald-500" size={24} />,
    bgGradient: "from-emerald-50 to-teal-50",
    link: "/industries/gym",
    features: ["رزرو کلاس", "مدیریت مربیان", "ظرفیت‌سازی"],
    rating: 4.7,
    reviews: 56
  }
];

export default function CustomBookingSamples() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-slate-900">
            نمونه صفحات ساخته شده با آنتایم
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            هزاران کسب‌وکار با آنتایم صفحه اختصاصی خود را ساخته‌اند. نمونه‌هایی از صفحات حرفه‌ای:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {samples.map((sample, index) => (
            <Link
              key={index}
              href={sample.link}
              className={`group relative bg-gradient-to-br ${sample.bgGradient} rounded-2xl p-5 md:p-6 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}
            >
              {/* آیکون صنعت */}
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                {sample.icon}
              </div>
              
              {/* عنوان */}
              <h3 className="font-black text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                {sample.title}
              </h3>
              
              {/* امتیاز */}
              <div className="flex items-center gap-1 mb-3">
                <div className="flex text-yellow-400">
                  {"★".repeat(Math.floor(sample.rating))}
                  {sample.rating % 1 !== 0 && <span className="text-yellow-400">½</span>}
                </div>
                <span className="text-slate-400 text-[10px]">({sample.reviews} نظر)</span>
              </div>
              
              {/* ویژگی‌ها */}
              <div className="space-y-1.5 mb-4">
                {sample.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 text-xs">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
              
              {/* لینک مشاهده */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  مشاهده صفحه
                  <ExternalLink size={12} />
                </span>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                  ←
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <p className="text-slate-500 text-xs sm:text-sm">
            و هزاران کسب‌وکار دیگر در صنایع مختلف...
          </p>
        </div>
      </div>
    </section>
  );
}