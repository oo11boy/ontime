"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Phone, Save, ArrowRight, Loader2, ShieldCheck, 
  UserCircle, Briefcase, Building2, MapPin, ChevronLeft 
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [jobs, setJobs] = useState<{ id: number; persian_name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    job_id: "",
    business_name: "",
    business_address: ""  // فیلد جدید آدرس
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        const [jobsRes, userRes] = await Promise.all([
          fetch("/api/client/jobs/list"),
          fetch("/api/client/settings")
        ]);
        
        const jobsData = await jobsRes.json();
        const userData = await userRes.json();

        setJobs(jobsData.jobs || []);
        if (userData.success && userData.user) {
          setFormData({
            name: userData.user.name || "",
            phone: userData.user.phone || "",
            job_id: userData.user.job_id?.toString() || "",
            business_name: userData.user.business_name || "",
            business_address: userData.user.business_address || ""  // مقدار آدرس از سرور
          });
        }
      } catch (err) {
        toast.error("خطا در دریافت اطلاعات");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.job_id) {
      toast.error("نام، شماره تماس و نوع تخصص الزامی است");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("تغییرات با موفقیت ذخیره شد");
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } else {
        const data = await res.json();
        toast.error(data.message || "خطایی رخ داد");
      }
    } catch (error) {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060910]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen text-white max-w-md mx-auto bg-[#060910] font-sans" dir="rtl">
      {/* Header مدرن */}
      <header className="sticky top-0 z-[60] bg-[#060910]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <UserCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">تنظیمات</h1>
            <p className="text-[11px] text-gray-500 font-medium">Profile & Business</p>
          </div>
        </div>
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <ChevronLeft className="w-6 h-6 rotate-180" />
        </button>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 py-8 space-y-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          
          {/* بخش اطلاعات شخصی */}
          <section className="space-y-6">
            <h3 className="text-[13px] font-black text-emerald-500/80 mr-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              اطلاعات حساب
            </h3>

            <motion.div variants={itemVariants} className="space-y-5">
              {/* نام و نام خانوادگی */}
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-emerald-500/50 rounded-[20px] pr-12 pl-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-600 font-bold"
                />
              </div>

              {/* شماره موبایل */}
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  readOnly
                  className="w-full bg-white/[0.01] border border-white/[0.05] rounded-[20px] pr-12 pl-5 py-4 text-sm text-gray-500 cursor-not-allowed font-mono tracking-widest"
                />
              </div>
            </motion.div>
          </section>

          {/* بخش کسب و کار */}
          <section className="space-y-6 p-6 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[32px] border border-white/[0.05] shadow-inner">
            <h3 className="text-[13px] font-black text-emerald-500/80 flex items-center gap-2">
               <Building2 size={16} /> جزئیات بیزنس
            </h3>

            <motion.div variants={itemVariants} className="space-y-5">
              {/* نام بیزنس */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="نام برند یا کسب‌وکار شما"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all font-black text-emerald-50 shadow-sm"
                />
              </div>

              {/* آدرس کسب‌وکار - فیلد جدید */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute right-4 top-4 text-gray-500">
                    <MapPin size={20} />
                  </div>
                  <textarea
                    placeholder="آدرس کامل کسب‌وکار (خیابان، پلاک، طبقه و...)"
                    value={formData.business_address}
                    onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-emerald-500 rounded-2xl pr-12 pl-5 py-4 text-sm focus:outline-none transition-all resize-none font-medium text-gray-200 placeholder:text-gray-600"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mr-1">
                  این آدرس در پیامک‌های ارسالی به مشتریان و لینک رزرو نمایش داده می‌شود.
                </p>
              </div>

              {/* شاخه کاری */}
              <div className="relative">
                <select
                  value={formData.job_id}
                  onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-2xl px-5 py-4 text-sm appearance-none focus:outline-none cursor-pointer font-bold text-gray-200"
                >
                  <option value="" disabled className="bg-[#0c111d]">انتخاب تخصص...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id.toString()} className="bg-[#0c111d]">
                      {j.persian_name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                  <Briefcase size={18} />
                </div>
              </div>
            </motion.div>

            {/* کارت راهنما */}
            <div className="flex gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-gray-400 leading-relaxed font-medium">
                <p className="mb-1">نام کسب‌وکار شما به عنوان امضا در پایین پیامک‌های ارسالی درج می‌شود.</p>
                <p>آدرس دقیق کمک می‌کند مشتریان راحت‌تر شما را پیدا کنند.</p>
              </div>
            </div>
          </section>

          {/* دکمه ذخیره */}
          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-[64px] bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-[0_20px_40px_rgba(16,185,129,0.25)] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Save size={22} strokeWidth={2.5} />
                  <span className="text-lg">ذخیره تغییرات</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}