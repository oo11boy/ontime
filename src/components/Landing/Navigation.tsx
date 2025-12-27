"use client";

import {
  Building,
  CreditCard,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  Workflow,
  ArrowLeft,
  Book,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Navigation(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // تغییر استایل نوار ناوبری هنگام اسکرول
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // جلوگیری از اسکرول صفحه اصلی وقتی منو باز است
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const menuItems = [
    { href: "../#features", label: "امکانات", icon: <Sparkles size={18} /> },
    { href: "../#pricing", label: "تعرفه‌ها", icon: <CreditCard size={18} /> },
    { href: "../#roi", label: "ماشین حساب", icon: <Workflow size={18} /> },
    { href: "../#faq", label: "سوالات متداول", icon: <HelpCircle size={18} /> },
    { href: "../#industries", label: "درباره آنتایم", icon: <Building size={18} /> },
    { href: "../blog", label: "مجله آنتایم", icon: <Book size={18} /> },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-500  transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* بخش برندینگ و لوگو */}
        <Link href="/" className="flex items-center gap-3 group z-110">
          <div className="w-12 h-12 bg-linear-to-br rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500">
            <Image
              src="/icons/icon-192.png"
              width={48}
              height={48}
              alt="لوگو اپلیکیشن نوبت دهی آنتایم"
              className="text-white object-cover rounded-2xl font-black text-2xl italic"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
              آنتایم
            </span>
            <span className="text-[10px] text-slate-700 font-bold mt-1 uppercase tracking-tighter">
              OnTime App
            </span>
          </div>
        </Link>

        {/* منوی دسکتاپ */}
        <div className="hidden lg:flex items-center gap-6 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {menuItems.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* دکمه‌های عملیاتی دسکتاپ و همبرگر */}
        <div className="flex items-center gap-4">
          <Link
            href="/clientdashboard"
            className="hidden sm:flex bg-emerald-800 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-emerald-500 transition-all items-center gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              شروع ۲ ماه رایگان
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </span>
          </Link>

          <button
            className="lg:hidden p-3 text-slate-900 bg-slate-100 rounded-2xl active:scale-95"
            onClick={() => setIsOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* منوی موبایل (Overlay) */}
      <div
        className={`
          lg:hidden fixed inset-0 pb-5 h-screen bg-white z-200 transition-all duration-500 ease-in-out transform flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* هدر منوی موبایل برای دکمه بستن */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-2">
             <Image src="/icons/icon-192.png" width={32} height={32} alt="logo" className="rounded-lg" />
             <span className="font-black text-slate-900">منوی آنتایم</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 bg-slate-100 text-slate-900 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* محتوای قابل اسکرول منو */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            دسترسی سریع
          </p>
          
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-5 text-slate-800 font-black text-lg bg-slate-50 rounded-4xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent"
            >
              <div className="flex items-center gap-4">
                <span className="text-blue-600 bg-white p-2 rounded-xl shadow-sm">
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
              className="bg-emerald-600 text-white p-6 rounded-4xl font-black text-xl text-center shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              ۲ ماه رایگان شروع کنید
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </Link>
            <p className="text-center text-slate-500 text-xs font-bold py-4">
              پشتیبانی: ۰۹۹۸۱۳۹۴۸۳۲
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: string | undefined;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-all duration-300 relative group font-black text-[13px]"
    >
      <span className="group-hover:rotate-12 transition-all">
        {icon}
      </span>
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
    </Link>
  );
}