// components/BeautySalon/BeautyGallery.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2, X, Smartphone, ChevronLeft } from "lucide-react";

const screenshots = [
  
  { id: 1, src: "/images/screens/main.jpg", alt: "صفحه ابتدایی اپلیکیشن", label:"صفحه ابتدایی اپلیکیشن", desc: "صفحه‌ابتدایی اپلیکیشن نوبت دهی" },
  { id: 3, src: "/images/screens/service.jpg", alt: "تعریف خدمات", label: "لیست خدمات", desc: "تنظیم قیمت و زمان برای هر لاین زیبایی" },
  { id: 4, src: "/images/screens/calender.jpg", alt: "تقویم کاری", label: "تقویم نوبت‌دهی",  desc: "نمای کلی رزروهای روزانه و وضعیت سالن" },
 { id: 5, src: "/images/screens/customers.jpg", alt: "سوابق مشتریان", label: "بانک مشتریان", desc: "دسترسی سریع به پرونده و شماره هر مشتری" },
 { id: 2, src: "/images/screens/add.jpg", alt: "پنل افزودن نوبت‌ها", label: "افزودن نوبت‌ها", desc: "نمای کلی از قسمت افزودن نوبت" },
 
];

export default function BeautyGallery() {
  const [activeImage, setActiveImage] = useState(screenshots[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="gallery" className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
              نمای داخلی <span className="text-pink-500">اپلیکیشن</span>
            </h2>
            <p className="text-slate-400 font-bold text-lg">
              سادگی در طراحی، قدرت در مدیریت. تمام آنچه یک آرایشگر حرفه‌ای نیاز دارد.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800">
            <Smartphone size={20} className="text-pink-500" />
            <span>نسخه موبایل (PWA)</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* بخش انتخابگرها (سمت راست - ۴ ستون) */}
          <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
            {screenshots.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-500 text-right group ${
                  activeImage.id === img.id
                    ? "border-pink-600 bg-pink-600/10 shadow-2xl shadow-pink-900/20"
                    : "border-slate-800 bg-transparent hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full transition-all ${activeImage.id === img.id ? "bg-pink-500 scale-150" : "bg-slate-700"}`}></div>
                  <div>
                    <p className={`font-black text-lg ${activeImage.id === img.id ? "text-white" : "text-slate-400"}`}>
                      {img.label}
                    </p>
                    <p className={`text-xs mt-1 font-bold transition-opacity ${activeImage.id === img.id ? "text-pink-200/60 opacity-100" : "opacity-0"}`}>
                      {img.desc}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={20} className={`transition-transform ${activeImage.id === img.id ? "text-pink-500 -translate-x-2" : "text-slate-700"}`} />
              </button>
            ))}
          </div>

          {/* نمایشگر تصویر بلند (سمت چپ - ۷ ستون) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2">
            <div 
              className="relative w-full max-w-[300px] group cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            >
              {/* نور پس‌زمینه تصویر */}
              <div className="absolute -inset-10 bg-pink-600/10 blur-[120px] rounded-full"></div>
              
              <div className="relative rounded-[3rem] overflow-hidden border-[8px] border-slate-900 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-800">
                <div className="aspect-[11/18.5] relative bg-slate-900">
                  <Image
                    key={activeImage.id + activeImage.src}
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    className="w-full h-full  animate-in fade-in zoom-in-95 duration-500"
                  />
                  
                  {/* دکمه بزرگنمایی روی تصویر */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
                      <Maximize2 size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* برچسب زیر تصویر */}
              <div className="absolute -bottom-6 right-1/2 translate-x-1/2 bg-slate-900 border border-slate-800 px-6 py-2 rounded-full whitespace-nowrap">
                <span className="text-xs font-black text-slate-400">
                  {activeImage.alt}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* مودال تمام صفحه (Lightbox) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button className="absolute top-10 right-10 text-white/50 hover:text-pink-500 transition-colors">
            <X size={40} />
          </button>
          <div className="h-[90vh] aspect-[9/19] relative">
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="w-full h-full object-contain rounded-2xl animate-in zoom-in-90 duration-300 shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}