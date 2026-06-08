// app/industries/custom-booking-page/components/CustomBookingShowcase.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Image, List, Star, Calendar, MessageSquare, Users, ThumbsUp, Edit, Trash2, Send } from "lucide-react";

export default function CustomBookingShowcase() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "معرفی کسب و کار", icon: <Users size={16} /> },
    { id: "gallery", label: "گالری نمونه کار", icon: <Image size={16} /> },
    { id: "services", label: "خدمات و قیمت", icon: <List size={16} /> },
    { id: "reviews", label: "نظرات مشتریان", icon: <Star size={16} /> },
    { id: "booking", label: "ثبت نوبت", icon: <Calendar size={16} /> },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* هدر بخش */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black mb-4">
            پیش‌نمایش زنده
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 md:mb-6">
            صفحه اختصاصی شما چه امکاناتی دارد؟
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            یک صفحه کامل و حرفه‌ای که تمام اطلاعات کسب‌وکار شما را در یکجا جمع می‌کند
          </p>
        </div>

        {/* تب‌ها */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 md:px-6 py-2 md:py-3 rounded-full font-black text-xs sm:text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-slate-600 hover:bg-blue-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* محتوای تب‌ها */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* تب معرفی کسب و کار */}
          {activeTab === "overview" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl">
                  A
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">آرایشگاه و سالن زیبایی آنتایم</h3>
                  <p className="text-slate-500 text-sm md:text-base mb-3">📍 تهران، خیابان ولیعصر، نبش کوچه گلستان</p>
                  <p className="text-slate-500 text-sm md:text-base mb-4">📞 ۰۲۱-۱۲۳۴۵۶۷۸ | 📱 ۰۹۹۸۱۳۹۴۸۳۲</p>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">📷</div>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">📧</div>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">💬</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                  سالن زیبایی آنتایم با بیش از ۱۰ سال تجربه در زمینه خدمات زیبایی و آرایشگاه، 
                  آماده ارائه بهترین خدمات به شما عزیزان است. تخصص ما در کاشت ناخن، کوتاهی مو و خدمات میکاپ می‌باشد.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold">
                  <CheckCircle2 size={16} />
                  دارای مجوز از اتحادیه
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold">
                  <CheckCircle2 size={16} />
                  کادر مجرب و حرفه‌ای
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs sm:text-sm font-bold">
                  <CheckCircle2 size={16} />
                  استفاده از مواد درجه یک
                </div>
              </div>
            </div>
          )}

          {/* تب گالری نمونه کار */}
          {activeTab === "gallery" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-xl flex items-center justify-center">
                    <Image size={32} className="text-slate-400" />
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-400 text-xs sm:text-sm mt-6">
                نمونه کارهای اخیر - برای مشاهده تصاویر بزرگتر کلیک کنید
              </p>
            </div>
          )}

          {/* تب خدمات و قیمت */}
          {activeTab === "services" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-black text-slate-800 text-sm md:text-base">✂️ کاشت ناخن (پودری)</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">زمان تقریبی: ۲ ساعت</p>
                  </div>
                  <p className="font-black text-blue-600 text-sm md:text-base">۲۵۰,۰۰۰ تومان</p>
                </div>
                <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-black text-slate-800 text-sm md:text-base">💇‍♀️ کوتاهی و لایت مو</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">زمان تقریبی: ۱.۵ ساعت</p>
                  </div>
                  <p className="font-black text-blue-600 text-sm md:text-base">۱۸۰,۰۰۰ تومان</p>
                </div>
                <div className="flex justify-between items-center p-3 md:p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-black text-slate-800 text-sm md:text-base">💅 ژلیش و طراحی ناخن</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">زمان تقریبی: ۱.۵ ساعت</p>
                  </div>
                  <p className="font-black text-blue-600 text-sm md:text-base">۲۰۰,۰۰۰ تومان</p>
                </div>
              </div>
            </div>
          )}

          {/* تب نظرات مشتریان */}
          {activeTab === "reviews" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-black">س</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-800 text-sm">سارا رضایی</p>
                      <div className="flex text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">خیلی راضی بودم، کاشت ناخن عالی بود. قطعاً دوباره میام.</p>
                    <p className="text-slate-400 text-[9px] sm:text-[10px] mt-1">۲ روز پیش</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-black">م</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-slate-800 text-sm">مریم کریمی</p>
                      <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">محیط خوب و پرسنل حرفه‌ای. فقط کمی شلوغ بود.</p>
                    <p className="text-slate-400 text-[9px] sm:text-[10px] mt-1">۱ هفته پیش</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-500 text-sm text-center">★ میانگین امتیاز: ۴.۹ از ۱۲۴ نظر</p>
              </div>
            </div>
          )}

          {/* تب ثبت نوبت */}
          {activeTab === "booking" && (
            <div className="p-6 md:p-8 lg:p-10">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <p className="font-black text-slate-800 mb-4">انتخاب سرویس</p>
                  <select className="w-full p-3 border border-slate-200 rounded-xl mb-4">
                    <option>کاشت ناخن (۲۵۰,۰۰۰ تومان)</option>
                    <option>کوتاهی و لایت مو (۱۸۰,۰۰۰ تومان)</option>
                    <option>ژلیش و طراحی ناخن (۲۰۰,۰۰۰ تومان)</option>
                  </select>
                  <p className="font-black text-slate-800 mb-4">انتخاب تاریخ و ساعت</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {["۱۰:۰۰", "۱۱:۳۰", "۱۴:۰۰", "۱۵:۳۰", "۱۷:۰۰", "۱۸:۳۰"].map((time) => (
                      <div key={time} className="border border-slate-200 rounded-lg p-2 text-center text-xs cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-black text-slate-800 mb-4">اطلاعات شما</p>
                  <input type="text" placeholder="نام و نام خانوادگی" className="w-full p-3 border border-slate-200 rounded-xl mb-3" />
                  <input type="tel" placeholder="شماره موبایل" className="w-full p-3 border border-slate-200 rounded-xl mb-4" />
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-black hover:bg-blue-700 transition-colors">
                    ثبت درخواست نوبت
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* مدیریت نوبت توسط مشتری */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-xs sm:text-sm border border-slate-200">
            <Edit size={14} className="text-blue-500" />
            تغییر نوبت توسط مشتری
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-xs sm:text-sm border border-slate-200">
            <Trash2 size={14} className="text-red-500" />
            لغو نوبت با ذکر دلیل
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-xs sm:text-sm border border-slate-200">
            <Send size={14} className="text-emerald-500" />
            پیامک یادآوری خودکار
          </div>
        </div>

        {/* توضیحات پایین */}
        <div className="text-center mt-8 text-slate-500 text-xs sm:text-sm">
          <p>⭐ تمام این امکانات در صفحه اختصاصی شما فعال است</p>
        </div>
      </div>
    </section>
  );
}