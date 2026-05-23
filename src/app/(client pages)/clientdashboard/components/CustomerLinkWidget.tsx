// src/app/clientdashboard/components/CustomerLinkWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Link2, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Sparkles,
  Rocket,
  Settings,
  ArrowLeft,
  Star,
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Share2,
  Eye
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function CustomerLinkWidget() {
  const router = useRouter();
  const [linkData, setLinkData] = useState<{ fullUrl: string; slug: string; totalVisits?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCustomerLink();
  }, []);

  const fetchCustomerLink = async () => {
    try {
      const res = await fetch("/api/client/customer-link");
      const data = await res.json();
      if (data.success && data.hasLink && data.link) {
        setLinkData({
          fullUrl: data.link.fullUrl,
          slug: data.link.slug,
          totalVisits: data.link.totalVisits || 0,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!linkData) return;
    navigator.clipboard.writeText(`https://${linkData.fullUrl}`);
    setCopied(true);
    toast.success("لینک کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManage = () => {
    router.push("/clientdashboard/customer-link");
  };

  if (isLoading) return null;

  // حالت: لینک دارد
  if (linkData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-5 shadow-xl"
      >
        {/* افکت‌های پس‌زمینه */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl" />
        
        {/* هدر */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl p-1.5">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">لینک صفحه اختصاصی شما</h3>
             </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-bold">{linkData.totalVisits?.toLocaleString() || 0}</span>
            <span className="text-emerald-100 text-[9px]">بازدید</span>
          </div>
        </div>

        {/* لینک */}
        <div className="relative bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/20">
          <p className="text-emerald-100 text-[9px] mb-1">آدرس صفحه اختصاصی:</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-white text-xs font-mono truncate flex-1">
              {linkData.fullUrl}
            </p>
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-all hover:scale-105"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
        </div>



        {/* دکمه مدیریت */}
        <button
          onClick={handleManage}
          className="relative w-full bg-white/20 hover:bg-white/30 rounded-xl py-2.5 text-white text-sm font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          مدیریت صفحه اختصاصی
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  // حالت: لینک ندارد - تشویق زیبا و جذاب
  return (
    <motion.button
      onClick={handleManage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative w-full group overflow-hidden rounded-2xl p-5 text-right transition-all duration-500 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #1a2a3a 0%, #0f172a 50%, #0a0f1a 100%)",
        boxShadow: "0 20px 35px -10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* انیمیشن پس‌زمینه متحرک */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
        <div className="absolute top-0 -right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* ستاره‌های تزئینی */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition">
        <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
      </div>
      <div className="absolute bottom-3 left-3 opacity-10 group-hover:opacity-20 transition">
        <Star className="w-6 h-6 text-white" />
      </div>

      <div className="relative z-10">
        {/* آیکون اصلی با افکت */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* متن تشویقی */}
        <h3 className="text-white font-bold text-lg text-center mb-2">
          صفحه اختصاصی ندارید؟
        </h3>
        <p className="text-slate-300 text-sm text-center mb-4 leading-relaxed">
          با ساختن صفحه اختصاصی، کسب‌وکار خود را به صورت حرفه‌ای به مشتریان معرفی کنید
        </p>

        {/* مزایا به صورت لیبل */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-white text-[10px]">ثبت نوبت آنلاین</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-white text-[10px]">آمار کامل</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <Share2 className="w-3 h-3 text-emerald-400" />
            <span className="text-white text-[10px]">لینک اختصاصی</span>
          </div>
        </div>

        {/* دکمه ساخت صفحه با افکت درخشان */}
        <div className="relative group/btn">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition duration-300" />
          <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl py-3 text-white font-bold text-sm transition-all group-hover/btn:scale-[0.98]">
            <Rocket className="w-4 h-4" />
            ساخت صفحه اختصاصی
            <ArrowLeft className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* متن تشویقی پایین */}
        <p className="text-center text-slate-400 text-[10px] mt-3">
          ✨ کاملاً رایگان • یک دقیقه‌ای • بدون نیاز به تخصص فنی
        </p>
        
        {/* نشان اعتماد */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            <span className="text-slate-400 text-[8px]">بیش از ۱۰۰۰ کسب‌وکار</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            <span className="text-slate-400 text-[8px]">رضایت ۹۸٪</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}