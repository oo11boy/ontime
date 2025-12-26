"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  Calendar,
  Smartphone,
  Zap,
} from "lucide-react";
import Image from "next/image";


export default function HeroSection() {
  return (
    <article>
      <section
        className="relative py-12 lg:py-24 overflow-hidden bg-white"
        dir="rtl"
      >


        <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-white to-cyan-50/50 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-right z-10">
            {/* ۲. اصلاح LCP: ساده‌سازی استایل H1 برای رندر سریع‌تر */}
            <h1 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[1.2] mb-8">
              اپلیکیشن <span className="text-blue-600">نوبت دهی آنلاین</span>؛{" "}
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-l from-blue-600 to-cyan-500 italic">
                هوشمند، سریع و تحت وب
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs mb-8 border border-blue-100 shadow-sm">
              <Zap size={14} className="text-amber-500" />
              <h2 className="text-[11px] lg:text-xs font-bold">
                برترین سامانه نوبت دهی آنلاین آرایشگاه، مطب پزشکان و دفاتر حقوقی
              </h2>
            </div>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-medium">
              با اپلیکیشن نوبت دهی آنتایم، مدیریت رزروها را
              خودکار کنید. ارسال خودکار <strong>پیامک یادآوری نوبت</strong>،
              کاهش کنسلی‌ها و صفحه رزرو اختصاصی مشتری.
            </p>

            <div className="flex flex-wrap gap-5">
              <Link
                href="/clientdashboard"
                // ۳. رفع ارور Accessibility: افزودن لیبل متمایز
                aria-label="ثبت نام و شروع دوره رایگان دو ماهه آنتایم"
                title="ثبت نام در سامانه نوبت دهی آنلاین آنتایم"
                className="px-10 py-5 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-3xl font-black text-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-4 shadow-xl shadow-blue-200"
              >
                ۲ ماه رایگان شروع کنید
                <ArrowLeft size={24} />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <FeatureItem title="ارسال هوشمند پیامک یادآوری" />
              <FeatureItem title="مدیریت مشتریان و نوبت‌ها" />
              <FeatureItem title="لینک رزرو اختصاصی تحت وب" />
              <FeatureItem title="تقویم آنلاین مدیریت متخصصین" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-10 bg-linear-to-tr from-blue-400/20 to-purple-400/10 rounded-full blur-[100px] pointer-events-none group-hover:blur-[120px] transition-all duration-700"></div>

            <div className="relative bg-white rounded-[3rem] p-6 shadow-2xl border border-slate-100 shadow-blue-100/50">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  OnTime Dashboard Preview
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <Calendar className="text-blue-600 mb-2" size={20} />
                  <p className="text-[10px] text-blue-700 font-bold uppercase">Active Slots</p>
                  <p className="text-lg font-black text-slate-800">۱۸ رزرو فعال</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <MessageSquare className="text-purple-600 mb-2" size={20} />
                  <p className="text-[10px] text-purple-700 font-bold uppercase">SMS Reminder</p>
                  <p className="text-lg font-black text-slate-800">ارسال خودکار</p>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden bg-slate-100 aspect-3/2">
                {/* ۴. بهینه‌سازی تصویر برای نمره ۱۰۰ عملکرد */}
                <Image
                  src="/images/app.jpg"
                  fill // استفاده از fill برای کنترل بهتر در کانتینر ریسپانسیو
                  sizes="(max-width: 768px) 100vw, 600px"
                  alt="پنل مدیریت سامانه نوبت دهی آنلاین آنتایم ویژه کسب و کارهای خدماتی"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={true} // بارگذاری با اولویت بالا
                  loading="eager" // بارگذاری بلافاصله
                  fetchPriority="high" // اولویت شبکه بالا
                  quality={85}
                />
              </div>

              <div className="absolute -left-8 bottom-12 bg-white p-4 rounded-2xl shadow-2xl border border-blue-50 flex items-center gap-3 shadow-blue-200/50">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Smartphone className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 leading-none mb-1 text-right">تجربه مشتری</p>
                  <p className="text-sm font-black text-slate-800 text-right">رزرو بدون نیاز به نصب</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function FeatureItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="bg-green-100 p-1 rounded-full group-hover:bg-green-500 transition-colors">
        <CheckCircle className="text-green-600 group-hover:text-white transition-colors" size={18} />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
  );
}