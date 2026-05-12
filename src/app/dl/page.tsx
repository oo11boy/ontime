// src/app/download/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  Calendar,
  Bell,
  Users,
  Clock,
  MessageSquare,
  Shield,
  Download,
  CheckCircle2,
  Star,
  ArrowLeft,
  QrCode,
} from "lucide-react";

export default function DownloadPage() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "ثبت نوبت آنلاین مشتری",
      description:
        "مشتریان شما بدون نیاز به تماس تلفنی، نوبت خود را آنلاین ثبت می‌کنند",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: Bell,
      title: "یادآوری خودکار نوبت با پیامک",
      description: "ارسال خودکار پیامک یادآوری برای جلوگیری از فراموشی مشتریان",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Users,
      title: "مدیریت پرسنل مجموعه",
      description: "تعریف چندین پرسنل با دسترسی‌های مجزا و مدیریت تقویم کاری",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      icon: Clock,
      title: "مدیریت زمان‌بندی هوشمند",
      description:
        "تقویم شمسی حرفه‌ای با امکان تعیین زمان‌های خالی و جلوگیری از تداخل",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: MessageSquare,
      title: "پیامک اطلاع‌رسانی خودکار",
      description: "ارسال خودکار پیامک تایید نوبت و اطلاع‌رسانی تغییرات",
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      icon: Shield,
      title: "امنیت و پشتیبانی ابری",
      description: "ذخیره امن اطلاعات در سرورهای ابری با پشتیبانی ۲۴ ساعته",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
  ];

  const stats = [
    { value: "۵۰۰+", label: "کسب‌وکار فعال" },
    { value: "۵۰,۰۰۰+", label: "نوبت ثبت شده" },
    { value: "۹۹٪", label: "رضایت کاربران" },
    { value: "۲۴/۷", label: "پشتیبانی" },
  ];

  const handleDownload = () => {
    window.location.href = "/app/ontime.apk";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1115] via-[#1a1e26] to-[#0f1115]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1115]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">آنتایم</span>
          </Link>
          <Link
            href="../"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-right">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">
                    نسخه اندروید
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  اپلیکیشن مدیریت هوشمند
                  <span className="text-emerald-400"> نوبت‌دهی</span>
                </h1>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  آنتایم یک پلتفرم کامل برای مدیریت نوبت‌دهی، مشتریان و ارسال
                  خودکار پیامک است. کسب‌وکار خود را هوشمندانه مدیریت کنید.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-white text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    دانلود اپلیکیشن اندروید
                  </motion.button>
                  <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                    <QrCode className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        اسکن QR کد
                      </p>
                      <p className="text-gray-500 text-xs">دانلود مستقیم</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-center lg:justify-start mt-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-[#0f1115] flex items-center justify-center"
                      >
                        <span className="text-xs text-gray-400">👤</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm">
                    <span className="text-emerald-400 font-bold">+۵۰۰</span>{" "}
                    کسب‌وکار به آنتایم اعتماد کرده‌اند
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative w-[280px] h-[560px] bg-[#1a1e26] rounded-[2.5rem] border-4 border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0f1115] rounded-b-xl z-10"></div>
                <div className="p-4 pt-8 h-full overflow-y-auto custom-scroll">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-bold">
                          نوبت امروز
                        </p>
                        <p className="text-white/70 text-[10px]">۳ نوبت فعال</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#242933] rounded-xl p-3 border border-white/5"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white text-sm font-bold">
                              مشتری عزیز
                            </p>
                            <p className="text-gray-400 text-xs">
                              خدمات آرایشگاه
                            </p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>
                        <p className="text-emerald-400 text-xs">
                          ۱۶:۳۰ - ۱۷:۰۰
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3 h-3 text-emerald-400" />
                      <p className="text-emerald-400 text-[10px]">
                        یادآوری خودکار پیامک
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-white/5 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              امکانات حرفه‌ای <span className="text-emerald-400">آنتایم</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ابزارهای قدرتمند برای مدیریت هوشمند کسب‌وکار شما
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-[#1a1e26] border border-white/5 hover:border-emerald-500/20 hover:bg-[#242933] transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>رایگان و حرفه‌ای</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-3xl p-12 border border-emerald-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              آماده اید کسب‌وکار خود را متحول کنید؟
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              همین الان اپلیکیشن آنتایم را دانلود کنید و مدیریت نوبت‌ها را
              یکپارچه کنید
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-bold text-white text-lg shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-5 h-5" />
              دانلود اپلیکیشن اندروید
            </motion.button>
            <p className="text-gray-500 text-xs mt-4">
              نسخه ۱.۰.۰ • حجم 5 مگابایت • کاملاً رایگان
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © ۱۴۰۵ تمامی حقوق محفوظ است | آنتایم
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-gray-500 text-sm hover:text-gray-300"
            >
              قوانین
            </Link>
            <Link
              href="/privacy"
              className="text-gray-500 text-sm hover:text-gray-300"
            >
              حریم خصوصی
            </Link>
            <Link
              href="/support"
              className="text-gray-500 text-sm hover:text-gray-300"
            >
              پشتیبانی
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #1a1e26;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
