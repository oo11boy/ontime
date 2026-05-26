"use client";

import {
  Instagram,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Scissors,
  Check,
  CheckCircle2Icon,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

export default function EnhancedFooter(): React.JSX.Element {
  const currentYear = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
  });
  const AparatIcon = ({ size = 18 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );

  const baseUrl = "https://ontimeapp.ir";

  // ========== اسکیماهای فوتر (برای کل سایت) ==========

  // 1. Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "آنتایم",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/icons/icon-512.png`,
    },
    sameAs: [
      "https://instagram.com/ontimeapp.ir",
      "https://t.me/ontime_sup",
      "https://ble.ir/ontimeapp",
      "https://www.aparat.com/ontimeapp",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+989981394832",
      contactType: "customer service",
      availableLanguage: "Persian",
      email: "ontimeappir@gmail.com",
    },
    foundingYear: "2023",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
    },
  };

  // 2. LocalBusiness Schema (برای کسب‌وکار)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "آنتایم",
    image: `${baseUrl}/icons/icon-512.png`,
    description: "اپلیکیشن هوشمند نوبت دهی آنلاین و مدیریت مشتریان",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
    },
    telephone: "+989981394832",
    priceRange: "رایگان تا ۲,۰۰۰,۰۰۰ تومان",
    openingHours: "Sa-Th 09:00-20:00",
  };

  // 3. BreadcrumbList Schema برای فوتر (اختیاری)
  const footerBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "محصولات تخصصی",
        item: `${baseUrl}/#industries`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "وبلاگ",
        item: `${baseUrl}/blog`,
      },
    ],
  };

  return (
    <footer
      className="bg-slate-950 text-slate-200 py-24 border-t border-white/5 relative overflow-hidden"
      dir="rtl"
    >
      {/* ========== تزریق اسکیماهای فوتر ========== */}
      <Script
        id="footer-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="footer-localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
        strategy="afterInteractive"
      />
      <Script
        id="footer-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(footerBreadcrumbSchema),
        }}
        strategy="afterInteractive"
      />

      {/* Glow Effect background */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mb-48 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* بخش برندینگ و درباره ما */}
          <div className="lg:col-span-2 space-y-8">
            <Link
              href="/"
              className="flex items-center gap-4 text-white group"
              aria-label="صفحه اصلی آنتایم"
            >
              <Image
                src="/icons/icon-192.png"
                width={64}
                height={64}
                alt="لوگو اپلیکیشن نوبت دهی آنلاین آنتایم"
                className="w-16 h-16 aspect-square object-cover rounded-[1.25rem] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter">
                  آنتایم
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  OnTime Scheduling Platform
                </span>
              </div>
            </Link>

            <p className="max-w-sm leading-relaxed text-lg text-slate-300 font-medium">
              ما در <strong>اپلیکیشن نوبت‌دهی آنتایم</strong> با هوشمندسازی
              فرآیند رزرو، به شما کمک می‌کنیم تا زمان خود را مدیریت کرده و
              درآمدتان را افزایش دهید.
            </p>

            <div className="flex gap-4">
              <SocialIcon
                icon={<Instagram size={20} />}
                label="اینستاگرام آنتایم"
                hoverColor="hover:bg-pink-600"
                href="https://instagram.com/ontimeapp.ir"
              />
              <SocialIcon
                icon={<Send size={20} />}
                label="تلگرام آنتایم"
                hoverColor="hover:bg-blue-500"
                href="https://t.me/ontime_sup"
              />
              <SocialIcon
                icon={<CheckCircle2Icon size={20} />}
                label="کانال بله آنتایم"
                hoverColor="hover:bg-blue-500"
                href="https://ble.ir/ontimeapp"
              />
              <SocialIcon
                icon={<AparatIcon />}
                label="کانال آپارات آنتایم"
                hoverColor="hover:bg-blue-500"
                href="https://www.aparat.com/ontimeapp"
              />
            </div>
          </div>

          {/* بخش محصولات و لندینگ‌های تخصصی */}
          <div>
            <FooterHeader title="کسب و کار ها" color="bg-blue-500" />
            <ul className="space-y-4 font-bold text-sm">
              <FooterLink href="/industries">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-pink-500" />
                  لیست صنایع
                </div>
              </FooterLink>
              <FooterLink href="/industries/beauty-salon">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-pink-500" />
                  نوبت دهی برای سالن های زیبایی و آرایشگاه
                </div>
              </FooterLink>
              <FooterLink href="/industries/nail-artist">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-rose-400" />
                  نوبت دهی برای ناخن کارها
                </div>
              </FooterLink>
            </ul>
          </div>

          {/* راهنما و منابع */}
          <div>
            <FooterHeader title="راهنما و منابع" color="bg-indigo-500" />
            <ul className="space-y-4 font-bold text-sm">
              <FooterLink href="../trainings">مرکز آموزش</FooterLink>
              <FooterLink href="../blog">وبلاگ و اخبار</FooterLink>
              <FooterLink href="../#faq">سوالات متداول</FooterLink>
            </ul>
          </div>

          {/* ارتباط با ما و نمادها */}
          <div>
            <FooterHeader title="ارتباط با ما" color="bg-emerald-500" />
            <ul className="space-y-6 font-bold text-sm">
              {/* <li className="flex items-center gap-4 group cursor-pointer text-slate-300 hover:text-white transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <Phone size={18} aria-hidden="true" />
                </div>
                <span className="tabular-nums text-base">۰۹۹۸۱۳۹۴۸۳۲</span>
              </li> */}
              <li className="flex items-center gap-4 group cursor-pointer text-slate-300 hover:text-white transition-all">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <Mail size={18} aria-hidden="true" />
                </div>
                <span className="text-sm tracking-tight">
                  ontimeappir@gmail.com
                </span>
              </li>
              <li className="pt-4 flex gap-4">
                <Link
                  href="/namad"
                  aria-label="نماد اعتماد الکترونیکی آنتایم"
                  className="w-full flex flex-col justify-center bg-white/5 rounded-2xl border border-white/10 items-center p-4 gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer group"
                >
                  <ShieldCheck
                    size={32}
                    className="opacity-60 text-emerald-400 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] text-center leading-relaxed text-slate-400 group-hover:text-white">
                    نماد اعتماد
                    <br />
                    الکترونیکی
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* بخش کپی رایت و گواهینامه‌ها */}
        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <ComplianceBadge text="ISO 27001 Certified" />
            <ComplianceBadge text="PCI DSS Security" />
            <ComplianceBadge text="SSL Encryption" />
            <ComplianceBadge text="Hosted in Iran" />
          </div>

          <div className="flex flex-col items-center lg:items-end gap-2">
            <p className="text-[12px] font-bold text-slate-300 tracking-wide">
              © {currentYear} تمامی حقوق برای پلتفرم نوبت‌دهی آنتایم محفوظ است.
            </p>
            <p className="text-[11px] font-bold text-slate-400">
              طراحی و توسعه توسط{" "}
              <a
                href="https://unicodewebdesign.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                تیم برنامه‌نویسی یونیکد
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Components کمکی ---

interface SocialIconProps {
  icon: React.ReactNode;
  hoverColor: string;
  label: string;
  href: string;
}

function SocialIcon({ icon, hoverColor, label, href }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 transition-all duration-500 ${hoverColor} hover:text-white hover:-translate-y-2 shadow-lg shadow-black/20`}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, {
            "aria-hidden": "true",
          })
        : icon}
    </a>
  );
}

function FooterHeader({ title, color }: { title: string; color: string }) {
  return (
    <h3 className="text-white font-black text-xl mb-10 flex items-center gap-3">
      <span className={`w-1.5 h-6 ${color} rounded-full`}></span>
      {title}
    </h3>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300"
      >
        <span className="w-0 group-hover:w-4 h-0.5 bg-blue-500 transition-all duration-300"></span>
        {children}
      </Link>
    </li>
  );
}

function ComplianceBadge({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-black text-slate-400 border border-white/10 bg-white/5 px-4 py-1.5 rounded-lg uppercase tracking-widest hover:border-blue-500/30 transition-colors cursor-default">
      {text}
    </span>
  );
}
