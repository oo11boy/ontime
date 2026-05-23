"use client";

import { Phone, MapPin, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { BusinessData } from "./types";

interface HeaderProps {
  business: BusinessData;
  isWorkingNow: boolean;
}

export function Header({ business, isWorkingNow }: HeaderProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.business_name,
        url: window.location.href,
      });
    } else {
      // Fallback برای مرورگرهایی که از Web Share API پشتیبانی نمی‌کنند
      navigator.clipboard.writeText(window.location.href);
      toast.success("لینک صفحه کپی شد");
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(business.phone);
    toast.success("شماره تماس کپی شد");
  };

  return (
    <div className="relative mb-6">
      <div className="h-72 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-b-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 rounded-b-3xl" />
        <div
          className="absolute inset-0 opacity-20 rounded-b-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>

      {/* فقط دکمه اشتراک‌گذاری */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20">
        <button
          onClick={handleShare}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="absolute -bottom-16 left-0 right-0 px-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden border-2 border-white/20 shadow-lg">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {business.business_name?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">{business.business_name}</h1>
              
              {/* آدرس */}
              <div className="flex items-center gap-1 mt-1 text-gray-300 text-xs">
                <MapPin size={12} className="text-emerald-400" />
                <span className="line-clamp-1">{business.business_address}</span>
              </div>

              {/* شماره تماس زیر آدرس */}
              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-1 mt-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <Phone size={10} className="text-emerald-400" />
                <span className="text-white text-xs font-medium" dir="ltr">
                  {business.phone}
                </span>
              </button>

              {/* وضعیت */}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                    isWorkingNow
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isWorkingNow ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                  {isWorkingNow ? "باز هستیم" : "تعطیل"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}