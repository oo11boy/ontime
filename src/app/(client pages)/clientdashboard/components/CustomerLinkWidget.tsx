// src/app/clientdashboard/components/CustomerLinkWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
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
  Share2,
  Eye,
  Users,
  Calendar,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  Gift,
  Flame,
  Trophy,
  Clock,
  Shield,
  Smartphone,
  Target,
  BarChart3,
  Link2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function CustomerLinkWidget() {
  const router = useRouter();
  const [linkData, setLinkData] = useState<{ fullUrl: string; slug: string; totalVisits?: number; totalBookings?: number } | null>(null);
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
          totalBookings: data.link.totalBookings || 0,
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
    toast.success("لینک کپی شد! حالا می‌تونید در شبکه‌های اجتماعی به اشتراک بذارید", {
      icon: "🎉",
      duration: 3000,
    });
    setTimeout(() => setCopied(false), 2000);
  };


  const handleManage = () => {
    router.push("/clientdashboard/customer-link");
  };

  if (isLoading) return null;

  // حالت: لینک دارد - با نمایش آمار زنده و Social Proof
  if (linkData) {

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-5 shadow-2xl"
      >
        {/* Live Activity Badge - Social Proof 2.0 */}
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1">
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping absolute" />
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            </div>
            </div>
        </div>

        {/* پس‌زمینه با افکت مدرن */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* هدر با آمار پیشرفته */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-xl p-1.5">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">صفحه اختصاصی شما</h3>
                <p className="text-emerald-100 text-[9px]">لینک هوشمند رزرو نوبت</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1">
                <Eye className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-bold">{linkData.totalVisits?.toLocaleString() || 0}</span>
              </div>
         
            </div>
          </div>

          {/* لینک با کپی یک‌کلیک */}
          <div className="relative bg-white/15 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/20">
            <p className="text-emerald-100 text-[9px] mb-1 flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              آدرس صفحه اختصاصی شما:
            </p>
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

          {/* دکمه‌های اکشن - با تاکید روی اشتراک‌گذاری */}
          <div className="flex gap-2 mb-3">
   
            <button
              onClick={handleManage}
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl py-2.5 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              مدیریت صفحه اختصاصی
            </button>
          </div>



          {/* مزایا با آیکون‌های جذاب */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
              <Target className="w-3 h-3 text-emerald-300" />
              <span className="text-white text-[9px]">رزرو آنلاین ۲۴/۷</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
              <BarChart3 className="w-3 h-3 text-emerald-300" />
              <span className="text-white text-[9px]">آمار لحظه‌ای</span>
            </div>
      
          </div>
        </div>
      </motion.div>
    );
  }

  // حالت: لینک ندارد - طراحی با آخرین متدهای جذب مشتری
  return (
    <motion.button
      onClick={handleManage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="relative w-full group overflow-hidden rounded-2xl p-5 text-right transition-all duration-500 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        boxShadow: "0 25px 40px -12px rgba(0,0,0,0.5)",
      }}
    >
      {/* انیمیشن گرادیانت متحرک - FOMO Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative z-10">
        {/* آیکون اصلی با افکت Gamification */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            {/* Micro-commitment badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full px-2 py-0.5 flex items-center gap-1 animate-bounce">
              <Gift className="w-3 h-3 text-white" />
              <span className="text-white text-[8px] font-bold">رایگان!</span>
            </div>
          </div>
        </div>

        {/* Value-first heading */}
        <h3 className="text-white font-bold text-xl text-center mb-2">
          🚀 مشتریان خود را آنلاین جذب کنید
        </h3>
        
        <p className="text-slate-300 text-sm text-center mb-4 leading-relaxed">
          با صفحه اختصاصی خود، مشتریان می‌توانند:
        </p>

        {/* Value propositions با افکت hover */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition group/item">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-white text-sm font-bold">نوبت آنلاین بگیرند</span>
              <p className="text-slate-400 text-[10px]">۲۴ ساعته، ۷ روز هفته</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition group/item">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-white text-sm font-bold">در شبکه‌های اجتماعی به اشتراک بگذارید</span>
              <p className="text-slate-400 text-[10px]">اینستاگرام، تلگرام، واتساپ و...</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition group/item">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 text-right">
              <span className="text-white text-sm font-bold">کسب‌وکار خود را معرفی کنند</span>
              <p className="text-slate-400 text-[10px]">نمایش خدمات، نظرات و نمونه کارها</p>
            </div>
          </div>
        </div>

        {/* Social Proof + FOMO ترکیبی */}
        <div className="flex items-center justify-between mb-4 p-2 bg-white/5 rounded-xl">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white/20 flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-white text-[10px] font-bold">ده ها کسب‌وکار فعال</p>
            <p className="text-emerald-400 text-[8px]">⭐ ۴.۹ از ۵ (۲۵۶ نظر)</p>
          </div>
          
        </div>

        {/* CTA با افکت urgency */}
        <div className="relative group/btn">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition duration-300 animate-pulse" />
          <div className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl py-3.5 text-white font-bold transition-all group-hover/btn:scale-[0.98]">
            <Rocket className="w-4 h-4" />
            ساختن صفحه اختصاصی (رایگان و دائمی)
            <ArrowLeft className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Micro-commitment text */}
        <p className="text-center text-slate-400 text-[9px] mt-3 flex items-center justify-center gap-2">
          <Clock className="w-3 h-3" />
          فقط ۲ دقیقه زمان نیاز دارید
          <Shield className="w-3 h-3" />
          کاملاً امن و رایگان
        </p>
      </div>
    </motion.button>
  );
}