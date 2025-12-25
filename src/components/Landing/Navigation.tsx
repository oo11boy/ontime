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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
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

  const menuItems = [
    { href: "#features", label: "امکانات", icon: <Sparkles size={18} /> },
    { href: "#pricing", label: "تعرفه‌ها", icon: <CreditCard size={18} /> },
    { href: "#roi", label: "ماشین حساب", icon: <Workflow size={18} /> },
    { href: "#faq", label: "سوالات متداول", icon: <HelpCircle size={18} /> },
    {
      href: "#industries",
      label: "درباره آنتایم",
      icon: <Building size={18} />,
    },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-100 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
      dir="rtl"
    >
      {/* اسکیمای ناوبری سایت برای درک بهتر ساختار توسط گوگل */}
      <Script
        id="navigation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "منوی اصلی آنتایم",
            itemListElement: [
              {
                "@type": "SiteNavigationElement",
                position: 1,
                name: "امکانات",
                url: "https://ontimeapp.ir/#features",
              },
              {
                "@type": "SiteNavigationElement",
                position: 2,
                name: "تعرفه‌ها",
                url: "https://ontimeapp.ir/#pricing",
              },
              {
                "@type": "SiteNavigationElement",
                position: 3,
                name: "ماشین حساب",
                url: "https://ontimeapp.ir/#roi",
              },
              {
                "@type": "SiteNavigationElement",
                position: 4,
                name: "سوالات متداول",
                url: "https://ontimeapp.ir/#faq",
              },
              {
                "@type": "SiteNavigationElement",
                position: 5,
                name: "درباره ما",
                url: "https://ontimeapp.ir/#industries",
              },
            ],
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* بخش برندینگ و لوگو */}
        <Link href="/" className="flex items-center gap-3 group z-110">
          <div className="w-12 h-12 bg-linear-to-br  rounded-2xl flex items-center justify-center  group-hover:rotate-12 transition-all duration-500">
            <Image
              src="/icons/icon-192.png"
              width={100}
              height={100}
              alt="لوگو اپلیکیشن نوبت دهی آنتایم"
              className="text-white rounded-2xl font-black text-2xl italic"
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

        {/* منوی دسکتاپ - بهبود یافته برای خوانایی */}
        <div className="hidden lg:flex items-center gap-6 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {menuItems.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* دکمه‌های عملیاتی دسکتاپ */}
        <div className="flex items-center gap-4">
          <Link
            href="/clientdashboard"
            className="hidden sm:flex bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-200 transition-all items-center gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              شروع ۲ ماه رایگان
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </span>
            <span className="absolute inset-0 bg-linear-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </Link>

          {/* همبرگر منو موبایل */}
          <button
            className="lg:hidden p-3 text-slate-900 bg-slate-100 rounded-2xl transition-all active:scale-95"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* منوی موبایل (Overlay) */}
      <div
        className={`
        lg:hidden fixed inset-0 top-0 h-screen bg-white z-100 transition-all duration-500 ease-in-out transform
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full p-8 pt-24 gap-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">
            منوی دسترسی سریع
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-5 text-slate-800 font-black text-lg bg-slate-50 rounded-3xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
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

          <div className="mt-auto pb-10 flex flex-col gap-4">
            <Link
              href="/clientdashboard"
              onClick={() => setIsOpen(false)}
              className="bg-emerald-600 text-white p-6 rounded-4xl font-black text-xl text-center shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              ۲ ماه رایگان شروع کنید
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </Link>
            <p className="text-center text-slate-600 text-xs font-bold">
              پشتیبانی نوبت‌دهی: ۰۹۹۸۱۳۹۴۸۳۲
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
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-all duration-300 relative group font-black text-[13px]"
    >
      <span className="text-slate-600 group-hover:text-blue-600 group-hover:rotate-12 transition-all">
        {icon}
      </span>
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
    </a>
  );
}
