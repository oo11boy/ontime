"use client";

import React from "react";
import {
  Phone,
  MessageCircle,
  Instagram,
  Clock,
  Headset,
  ArrowRight,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer/Footer";

export default function SupportPage() {
  const router = useRouter();

  const contacts = [
    {
      range: "۸ صبح تا ۱۵ ظهر",
      number: "09332884700",
 
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      range: "۱۵ عصر تا ۲۱ شب",
      number: "09981394832",
   
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen max-w-md m-auto bg-[#1a1e26] text-white pb-20">
      {/* Header */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowRight size={24} />
        </button>
        <div className="text-center z-10">
          <div className="bg-emerald-500/20 p-3 rounded-2xl inline-block mb-3">
            <Headset size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">مرکز پشتیبانی آنتایم</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 space-y-6 relative z-20">
        {/* بخش تماس تلفنی */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 px-1">
            <Clock size={18} />
            <span className="text-sm font-medium">ساعات پاسخگویی تلفنی</span>
          </div>

          <div className="grid gap-4">
            {contacts.map((item, index) => (
              <a
                key={index}
                href={`tel:${item.number}`}
                className={`flex items-center justify-between p-5 rounded-3xl bg-gradient-to-br ${item.color} border border-white/5 hover:border-white/10 transition-all active:scale-[0.98] shadow-xl`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-2xl bg-[#1a1e26] ${item.iconColor}`}
                  >
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">
                     ({item.range})
                    </p>
                    <p className="text-xl font-bold tracking-widest">
                      {item.number}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-full">
                  <ArrowRight size={18} className="rotate-180 opacity-30" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* بخش شبکه‌های اجتماعی */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400 px-1">
            <MessageCircle size={18} />
            <span className="text-sm font-medium">
              شبکه‌های اجتماعی و ارتباط آنلاین
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* تلگرام */}
            <a
              href="https://t.me/OnTime_sup"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-[#242933] border border-white/5 hover:border-sky-500/30 transition-all"
            >
              <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 group-hover:scale-110 transition-transform mb-3">
                <Send size={28} />
              </div>
              <span className="text-sm font-bold text-gray-200">تلگرام</span>
              <span className="text-[10px] text-sky-400 mt-1" dir="ltr">
                @OnTime_sup
              </span>
            </a>

            {/* اینستاگرام */}
            <a
              href="https://instagram.com/ontimeappir"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-[#242933] border border-white/5 hover:border-pink-500/30 transition-all"
            >
              <div className="bg-pink-500/10 p-4 rounded-2xl text-pink-400 group-hover:scale-110 transition-transform mb-3">
                <Instagram size={28} />
              </div>
              <span className="text-sm font-bold text-gray-200">
                اینستاگرام
              </span>
              <span className="text-[10px] text-pink-400 mt-1" dir="ltr">
                @ontimeappir
              </span>
            </a>
          </div>
        </section>

        {/* پیام پایین صفحه */}
        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
          <p className="text-xs text-emerald-200/60 leading-relaxed">
            تیم پشتیبانی آنتایم همواره در کنار شماست. در صورت بروز هرگونه مشکل
            یا سوال، از طریق راه‌های فوق با ما در ارتباط باشید.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
