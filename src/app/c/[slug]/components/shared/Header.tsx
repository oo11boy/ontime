"use client";

import { useState } from "react";
import { Phone, MapPin, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { BusinessData } from "./types";

interface HeaderProps {
  business: BusinessData;
  isWorkingNow: boolean;
}

export function Header({ business, isWorkingNow }: HeaderProps) {
  // State برای مدیریت خطای تصاویر
  const [coverError, setCoverError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const hasCover = !!business.cover_image && !coverError;
  const avatarImage = business.avatar_image || business.logo;
  const hasAvatar = !!avatarImage && !avatarError;

  // اشتراک‌گذاری
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.business_name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("لینک صفحه کپی شد");
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(business.phone);
    toast.success("شماره تماس کپی شد");
  };

  return (
    <div className="relative mb-8 md:mb-10">
      {/* ========== بخش کاور ========== */}
      <div className="relative h-64 sm:h-72  w-full overflow-hidden rounded-b-3xl md:rounded-b-4xl shadow-2xl">
        {hasCover ? (
          <>
            <img
              src={business.cover_image!}
              alt="کاور بیزینس"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="eager"
              onError={() => setCoverError(true)}
            />
            {/* لایه محو برای خوانایی متن */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 relative overflow-hidden">
            {/* پترن لوکس پشت زمینه */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M50 50v-6h-6v6h-6v6h6v6h6v-6h6v-6h-6zM50 10V4h-6v6h-6v6h6v6h6v-6h6v-6h-6zM10 50v-6H4v6H-2v6h6v6h6v-6h6v-6h-6zM10 10V4H4v6H-2v6h6v6h6v-6h6v-6h-6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
            {/* گرادینت محو برای عمق */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          </div>
        )}
      </div>

      {/* ========== دکمه اشتراک‌گذاری (شناور بالا-راست) ========== */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleShare}
          className="w-10 h-10 md:w-11 md:h-11 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 hover:scale-110 transition-all duration-300 shadow-lg border border-white/20"
          aria-label="اشتراک‌گذاری صفحه"
        >
          <Share2 size={20} className="md:w-5 md:h-5" />
        </button>
      </div>

      {/* ========== کارت اطلاعات (نیمه‌شفاف با انیمیشن) ========== */}
      <div className="absolute left-0 right-0 px-4 sm:px-6 -bottom-16 md:-bottom-20 z-10 animate-fadeInUp">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-5 border border-white/20 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/10">
            <div className="flex items-center gap-3 md:gap-5">
              {/* آواتار / لوگو */}
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0">
                  {hasAvatar ? (
                    <img
                      src={avatarImage!}
                      alt={`لوگوی ${business.business_name}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-black text-white drop-shadow-md">
                        {business.business_name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>
                {/* نشانگر آنلاین بودن (اختیاری - افکت لوکس دور آواتار) */}
                {isWorkingNow && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-md animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* نام بیزینس */}
                <h1 className="text-white text-lg md:text-xl lg:text-2xl font-bold truncate drop-shadow-md">
                  {business.business_name}
                </h1>

                {/* آدرس */}
                {business.business_address && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-gray-200 text-xs md:text-sm">
                    <MapPin size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="line-clamp-2">{business.business_address}</span>
                  </div>
                )}

                {/* شماره تماس + دکمه کپی */}
                {business.phone && (
                  <button
                    onClick={handleCopyPhone}
                    className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-105 active:scale-95"
                    aria-label="کپی شماره تماس"
                  >
                    <Phone size={12} className="text-emerald-400" />
                    <span className="text-white text-xs md:text-sm font-medium tracking-tight" dir="ltr">
                      {business.phone}
                    </span>
                  </button>
                )}

                {/* وضعیت باز/بسته */}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-semibold backdrop-blur-sm ${
                      isWorkingNow
                        ? "bg-emerald-500/30 text-emerald-100 border border-emerald-400/40"
                        : "bg-red-500/30 text-red-100 border border-red-400/40"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isWorkingNow ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                      }`}
                    />
                    {isWorkingNow ? "فعال" : "هم اکنون تعطیل"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== استایل انیمیشن fade-in-up ========== */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
      `}</style>
    </div>
  );
}