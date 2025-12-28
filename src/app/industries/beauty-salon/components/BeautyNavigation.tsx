// components/BeautySalon/BeautyNavigation.tsx
"use client";

import {
  CreditCard,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  Smartphone,
  ArrowLeft,
  Book,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function BeautyNavigation(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // تغییر استایل هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // مدیریت اسکرول بدنه هنگام باز بودن منو
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const menuItems = [
    { href: "#features", label: "امکانات هوشمند", icon: <Sparkles size={18} /> },
    { href: "#sms", label: "سیستم پیامک", icon: <Smartphone size={18} /> },
    { href: "#pricing", label: "پلن‌ها", icon: <CreditCard size={18} /> },
    { href: "#faq", label: "سوالات متداول", icon: <HelpCircle size={18} /> },
    { href: "/blog", label: "مجله آنتایم", icon: <Book size={18} /> },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-[500] transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* بخش برندینگ */}
        <Link href="/" className="flex items-center gap-3 group z-[110]">
          <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-pink-200">
            <Image
              src="/icons/icon-192.png"
              width={48}
              height={48}
              alt="لوگو آنتایم"
              className="object-cover rounded-2xl"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
              آنتایم
            </span>
            <span className="text-[10px] text-pink-600 font-bold mt-1 uppercase tracking-tighter">
              Beauty Edition
            </span>
          </div>
        </Link>

        {/* منوی دسکتاپ */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-pink-600 transition-all duration-300 relative group font-black text-[13px]"
            >
              <span className="group-hover:rotate-12 transition-all">{item.icon}</span>
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-1 bg-pink-600 rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
            </Link>
          ))}
        </div>

        {/* دکمه عملیاتی */}
        <div className="flex items-center gap-4">
          <Link
            href="/clientdashboard"
            className="hidden sm:flex bg-pink-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-pink-700 transition-all items-center gap-2 group relative shadow-xl shadow-pink-100"
          >
            شروع تست ۲ ماه رایگان
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </Link>

          <button
            className="lg:hidden p-3 text-slate-900 bg-slate-100 rounded-2xl active:scale-95"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={`
          lg:hidden fixed inset-0 pb-5 h-screen bg-white z-[600] transition-all duration-500 ease-in-out transform flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-2">
             <Image src="/icons/icon-192.png" width={32} height={32} alt="logo" className="rounded-lg shadow-sm" />
             <span className="font-black text-slate-900 italic">پنل مخصوص آرایشگران</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-pink-50 hover:text-pink-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            دسترسی سریع به بخش‌ها
          </p>
          
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-5 text-slate-800 font-black text-lg bg-slate-50 rounded-[2rem] hover:bg-pink-50 hover:text-pink-600 transition-all border border-transparent active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <span className="text-pink-600 bg-white p-2 rounded-xl shadow-sm">
                  {item.icon}
                </span>
                {item.label}
              </div>
              <ArrowLeft size={20} className="opacity-30" />
            </Link>
          ))}

          <div className="pt-10 mt-6 border-t border-slate-50 flex flex-col gap-4">
            <Link
              href="/clientdashboard"
              onClick={() => setIsOpen(false)}
              className="bg-pink-600 text-white p-6 rounded-[2rem] font-black text-xl text-center shadow-2xl shadow-pink-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              فعالسازی ۲ ماه رایگان
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </Link>
            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-slate-500 text-xs font-bold mb-1">مشاوره و پشتیبانی تلفنی:</p>
               <p className="text-slate-900 font-black text-lg tabular-nums">۰۹۹۸۱۳۹۴۸۳۲</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}