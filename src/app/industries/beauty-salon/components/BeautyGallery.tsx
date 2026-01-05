"use client";

import Image from "next/image";
import { useState } from "react";
import { Maximize2, X, Smartphone, ChevronLeft } from "lucide-react";



interface GalleryProps {
  title: React.ReactNode;
  description: string;
  accentColor?: "pink" | "blue" | "indigo" | "rose"; // رنگ تم کامپوننت
 
}

export default function UniversalAppGallery({ 
  title, 
  description, 
  accentColor = "blue", 
}: GalleryProps) {

const screenshots = [
  
  { id: 1, src: "/images/screens/newmain.jpg", alt: "صفحه ابتدایی اپلیکیشن نوبت دهی آنتایم", label:"صفحه ابتدایی اپلیکیشن", desc: "صفحه‌ابتدایی اپلیکیشن نوبت دهی" },
  { id: 3, src: "/images/screens/servicelistnail.jpg", alt: "تعریف خدمات نوبتدهی آنتایم", label: "لیست خدمات", desc: "تنظیم قیمت و زمان " },
  { id: 4, src: "/images/screens/calendernail.jpg", alt: "تقویم کاری اپلیکیشن نوبت دهی آنلاین آنتایم", label: "تقویم نوبت‌دهی",  desc: "نمای کلی رزروهای روزانه " },
 { id: 5, src: "/images/screens/customlist.jpg", alt: "سوابق مشتریان در اپلیکیشن نوبتدهی آنلاین آنتایم", label: "بانک مشتریان", desc: "دسترسی سریع به پرونده و شماره هر مشتری" },
 { id: 6, src: "/images/screens/addnail.jpg", alt: "پنل افزودن نوبت‌ها در نرم افزار نوبت دهی آنلاین آنتایم", label: "افزودن نوبت‌ها", desc: "نمای کلی از قسمت افزودن نوبت" },
  { id:7, src: "/images/screens/shift.jpg", alt: "تعیین شیفت و تعطیلات در نرم افزار نوبت دهی آنلاین آنتایم", label: "تعیین شیفت و تعطیلات", desc: "نمای کلی از قسمت تعیین شیفت و تعطیلات اپ نوبت دهی آنتایم " },
 
];
  const [activeImage, setActiveImage] = useState(screenshots[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // مدیریت رنگ‌ها بر اساس انتخاب
  const colorClasses = {
    pink: {
      text: "text-pink-500",
      border: "border-pink-600",
      bg: "bg-pink-600/10",
      glow: "bg-pink-600/10",
      buttonActive: "bg-pink-500"
    },
    blue: {
      text: "text-blue-500",
      border: "border-blue-600",
      bg: "bg-blue-600/10",
      glow: "bg-blue-600/10",
      buttonActive: "bg-blue-500"
    },
    indigo: {
      text: "text-indigo-500",
      border: "border-indigo-600",
      bg: "bg-indigo-600/10",
      glow: "bg-indigo-600/10",
      buttonActive: "bg-indigo-500"
    },
       rose: {
      text: "text-rose-600",
      border: "border-rose-600",
      bg: "bg-rose-600/10",
      glow: "bg-rose-600/10",
      buttonActive: "bg-rose-500"
    }
  };

  const currentTheme = colorClasses[accentColor];

  return (
    <section id="gallery" className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl text-right">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight text-white">
              {title}
            </h2>
            <p className="text-slate-400 font-bold text-lg">
              {description}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800">
            <Smartphone size={20} className={currentTheme.text} />
            <span>نسخه موبایل (PWA)</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* بخش انتخابگرها */}
          <div className="lg:col-span-5 space-y-3 order-2 lg:order-1">
            {screenshots.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-500 text-right group ${
                  activeImage.id === img.id
                    ? `${currentTheme.border} ${currentTheme.bg} shadow-2xl shadow-black/20`
                    : "border-slate-800 bg-transparent hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full transition-all ${activeImage.id === img.id ? currentTheme.buttonActive + " scale-150" : "bg-slate-700"}`}></div>
                  <div>
                    <p className={`font-black text-lg ${activeImage.id === img.id ? "text-white" : "text-slate-400"}`}>
                      {img.label}
                    </p>
                    <p className={`text-xs mt-1 font-bold transition-opacity ${activeImage.id === img.id ? "text-white/60 opacity-100" : "opacity-0"}`}>
                      {img.desc}
                    </p>
                  </div>
                </div>
                <ChevronLeft size={20} className={`transition-transform ${activeImage.id === img.id ? currentTheme.text + " -translate-x-2" : "text-slate-700"}`} />
              </button>
            ))}
          </div>

          {/* نمایشگر تصویر موبایل */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2">
            <div 
              className="relative w-full max-w-[300px] group cursor-zoom-in"
              onClick={() => setIsModalOpen(true)}
            >
              <div className={`absolute -inset-10 ${currentTheme.glow} blur-[120px] rounded-full`}></div>
              
              <div className="relative rounded-[3rem] overflow-hidden border-[8px] border-slate-900 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-800">
                <div className="aspect-[9/18] relative bg-slate-900">
                  <Image
                    key={activeImage.id + activeImage.src}
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    className="w-full h-full animate-in fade-in zoom-in-95 duration-500 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20">
                      <Maximize2 size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

            
            </div>
          </div>

        </div>
      </div>

      {/* مودال Lightbox */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
            <X size={40} />
          </button>
          <div className="h-[90vh] aspect-[10/19] relative">
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