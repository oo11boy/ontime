"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Zap,
  Smartphone,
} from "lucide-react";

export default function NailArtistHero() {
  return (
    <section className="relative mt-12 py-16 lg:py-28 overflow-hidden bg-white">
      {/* بک‌گراند با تم رنگی ملایم‌تر متناسب با لاین ناخن */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          {/* H1 اصلی برای سئو - کاملاً متفاوت از صفحه آرایشگاه */}
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-6">
            نرم افزار نوبت دهی ناخن کار و کاشت ناخن
          </h1>

          {/* H2 فرعی */}
          <h2 className="text-xl lg:text-2xl font-bold text-rose-600 mb-6">
            مدیریت هوشمند نوبت کاشت، ترمیم و ژلیش ویژه ناخن‌کاران حرفه‌ای
          </h2>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
            با{" "}
            <strong className="text-rose-600">
              نرم افزار نوبت دهی ناخن کار آنتایم
            </strong>
            ، لیست مشتریان کاشت و ژلیش را هوشمندانه مدیریت کنید. سیستم خودکار
            یادآوری، کنسلی‌ها را تا ۸۰ درصد کاهش می‌دهد و زمان دقیق ترمیم را به
            مشتریان شما پیامک می‌کند.
          </p>

          {/* بنر ۲ هفته رایگان - متناسب با ناخن‌کاران */}
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-100 text-rose-700 font-bold text-sm mb-6">
            <Zap size={14} className="text-rose-500" />★ ۲ هفته رایگان + ۵۰
            پیامک یادآوری ترمیم ★
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link
              href="/clientdashboard"
              className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 text-center flex items-center justify-center gap-2"
            >
              شروع رایگان ۲ هفته‌ای
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* ویژگی‌های متمایز و مختص ناخن‌کاران - غیر تکراری */}
          <div className="space-y-4 border-r-4 border-rose-200 pr-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              تقویم تخصصی با تفکیک خدمات کاشت، ترمیم، ژلیش و طراحی
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              پیامک یادآوری خودکار نوبت ترمیم (۲۴ ساعت قبل از موعد)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              پرونده تخصصی هر مشتری با ثبت رنگ و مدل کاشت قبلی
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-rose-600">
              <CheckCircle2 size={18} className="text-rose-600" />✓ ۲ هفته
              استفاده رایگان - بدون نیاز به کارت بانکی
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/* Mockup موبایل */}
          <div className="relative w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.2)] overflow-hidden">
            <Image
              src="/images/screens/newmain.jpg"
              fill
              alt="نمایش پنل مدیریت نرم افزار نوبت دهی ناخن کار آنتایم - مدیریت کاشت و ترمیم ناخن"
              priority
            />
          </div>

          {/* نمایش زنده تعداد رزرو برای جلب اعتماد - تخصصی ناخن */}
          <div className="absolute top-10 -right-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-rose-100 hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">
                نوبت ثبت شده ناخن‌کاران امروز
              </div>
              <div className="text-lg font-black text-slate-900 tabular-nums">
                +۴۵۰ نوبت
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
