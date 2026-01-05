"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, CheckCircle2, CalendarDays } from "lucide-react";

export default function NailArtistHero() {
  return (
    <section className="relative mt-12 py-16 lg:py-28 overflow-hidden bg-white">
      {/* بک‌گراند با تم رنگی ملایم‌تر متناسب با لاین ناخن */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 to-white -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-right">
          {/* Label تخصصی برای سئو محلی و صنفی */}
          <h1 className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs mb-8 shadow-lg shadow-rose-100">
            <Sparkles size={14} />
            اپلیکیشن اختصاصی مدیریت نوبت برای ناخن‌کاران حرفه‌ای
          </h1>

          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.3] mb-8">
            نظمِ نوین در <br />
            <span className="text-rose-500 ">
               نوبت‌دهی خدمات ناخن
            </span>{" "}
            و ترمیم
          </h2>

          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
            با <strong>نوبت‌دهی پیامکی آنتایم</strong>، لیست مشتریان کاشت و ژلیش را هوشمندانه مدیریت کنید. سیستم خودکار یادآوری ما، کنسلی‌ها را به حداقل رسانده و زمان دقیق ترمیم را به مشتریان شما یادآوری می‌کند.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/clientdashboard"
              className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 text-center flex items-center justify-center gap-2"
            >
              شروع کار با اپلیکیشن 
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* ویژگی‌های متمایز و غیر تکراری */}
          <div className="grid grid-cols-1 gap-4 border-r-4 border-rose-100 pr-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              تقویم نوبت دهی ناخن با قابلیت فیلتر خدمات (کاشت، ترمیم، ژلیش و غیره)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              یادآوری خودکار نوبت ترمیم (۲۴ ساعت قبل از موعد)
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CheckCircle2 size={18} className="text-rose-500" />
              تفکیک خدمات (کاشت، ترمیم، ژلیش، لمینت و طراحی)
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/* Mockup موبایل با تصویر محیط کاری ناخن */}
          <div className="relative w-[300px] lg:w-[350px] aspect-[10/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.2)] overflow-hidden">
            <Image
                  src="/images/screens/newmain.jpg"
              fill
              alt="اپلیکیشن نوبت دهی و یادآوری پیامکی ناخن کار آنتایم"
              className="object-cover"
              priority
            />
          </div>
          
          {/* نمایش زنده تعداد رزرو برای جلب اعتماد */}
          <div className="absolute top-10 -right-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-rose-50 hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <CalendarDays size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">رزروهای امروز صنف ناخن</div>
              <div className="text-lg font-black text-slate-900 tabular-nums">+۴۵۰ نوبت</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}