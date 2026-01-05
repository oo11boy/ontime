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
  Scissors
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function NailNavigation(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const menuItems = [
    { href: "#features", label: "مدیریت میز ناخن", icon: <Sparkles size={18} /> },
    { href: "#sms", label: "اطلاع‌رسانی ترمیم", icon: <Smartphone size={18} /> },
    { href: "#pricing", label: "اشتراک‌ها", icon: <CreditCard size={18} /> },
    { href: "#faq", label: "سوالات ناخن‌کاران", icon: <HelpCircle size={18} /> },
    { href: "/blog", label: "مجله تخصصی", icon: <Book size={18} /> },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-[500] transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-xl shadow-rose-900/5 py-3"
          : "bg-transparent py-6"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* بخش برندینگ اختصاصی ناخن */}
        <Link href="/" className="flex items-center gap-3 group z-[110]">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-rose-200">
            <Image
              src="/icons/icon-192.png"
              width={48}
              height={48}
              alt="لوگو آنتایم نوبت دهی"
              className="object-cover rounded-2xl"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
              آنتایم
            </span>
            <span className="text-[10px] text-rose-600 font-black mt-1 uppercase tracking-[0.1em]">
              Nail Expert Edition
            </span>
          </div>
        </Link>

        {/* منوی دسکتاپ - بهینه شده برای سئو */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200/60">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:text-rose-600 transition-all duration-300 relative group font-black text-[13px]"
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
              <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-rose-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
          ))}
        </div>

        {/* دکمه عملیاتی با تاکید بر هدیه */}
        <div className="flex items-center gap-4">
          <Link
            href="/clientdashboard"
            className="hidden sm:flex bg-slate-900 text-white px-7 py-3.5 rounded-2xl font-black text-sm hover:bg-rose-600 transition-all items-center gap-3 group shadow-xl shadow-slate-200"
          >
          شروع 2 ماه رایگان
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-rose-400" />
          </Link>

          <button
            className="lg:hidden p-3 text-slate-900 bg-white border border-slate-200 shadow-sm rounded-2xl active:scale-95"
            onClick={() => setIsOpen(true)}
            aria-label="Open Navigation"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* منوی موبایل بازطراحی شده */}
      <div
        className={`
          lg:hidden fixed inset-0 h-screen bg-white z-[600] transition-all duration-500 ease-in-out transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Scissors size={20} />
             </div>
             <span className="font-black text-slate-900">منوی مدیریت هوشمند</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-5 text-slate-700 font-black text-lg bg-slate-50 rounded-3xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <span className="text-rose-600">{item.icon}</span>
                {item.label}
              </div>
              <ArrowLeft size={18} className="opacity-20" />
            </Link>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-white border-t border-slate-50 space-y-4">
          <Link
            href="/clientdashboard"
            onClick={() => setIsOpen(false)}
            className="w-full bg-rose-600 text-white p-6 rounded-3xl font-black text-xl text-center shadow-2xl shadow-rose-200 flex items-center justify-center gap-3"
          >
            شروع رایگان (۲ ماه)
          </Link>
        </div>
      </div>
    </nav>
  );
}