"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Phone, Save, ArrowRight, Loader2, ShieldCheck, UserCircle, Briefcase 
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Footer from "../components/Footer/Footer";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    job_id: ""
  });

  // ۱. دریافت لیست مشاغل و اطلاعات فعلی کاربر به‌صورت همزمان
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        
        // دریافت لیست مشاغل
        const jobsRes = await fetch("/api/client/jobs/list");
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);

        // دریافت اطلاعات فعلی کاربر از API تنظیمات
        const userRes = await fetch("/api/client/settings");
        const userData = await userRes.json();

        if (userData.success && userData.user) {
          setFormData({
            name: userData.user.name || "",
            phone: userData.user.phone || "",
            // تبدیل id به string برای هماهنگی با value در select
            job_id: userData.user.job_id?.toString() || ""
          });
        }
      } catch (err) {
        toast.error("خطا در بارگذاری اطلاعات");
        console.error(err);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.job_id) {
      toast.error("لطفاً تمامی فیلدها را پر کنید");
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
        toast.success("تغییرات با موفقیت اعمال شد");
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } else {
        const data = await res.json();
        toast.error(data.message || "خطایی در عملیات رخ داد");
      }
    } catch (error) {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="mt-4 text-gray-400 text-sm">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative flex flex-col bg-[#121212]">
      {/* هدر ثابت */}
      <div className="sticky top-0 z-50 bg-[#121212]/80 backdrop-blur-lg border-b border-gray-800/50 px-4 py-4" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <UserCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-100">تنظیمات پروفایل</h1>
              <p className="text-[10px] text-gray-500">ویرایش اطلاعات حساب</p>
            </div>
          </div>
          <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/30 transition-all">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 pb-32" dir="rtl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1B1F28] border border-gray-700/50 rounded-4xl overflow-hidden shadow-2xl">
            <div className="p-6 md:p-8 space-y-7">
              
              {/* نام */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2 mr-1">
                  <User className="w-4 h-4 text-emerald-500" /> نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#232936] border border-gray-700/50 rounded-2xl px-5 py-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* انتخاب شغل - پیش‌فرض ست شده */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2 mr-1">
                  <Briefcase className="w-4 h-4 text-emerald-500" /> شاخه کاری
                </label>
                <select
                  value={formData.job_id}
                  onChange={(e) => setFormData({ ...formData, job_id: e.target.value })}
                  className="w-full bg-[#232936] border border-gray-700/50 rounded-2xl px-5 py-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none cursor-pointer"
                >
                  <option value="" disabled>انتخاب کنید...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id.toString()}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* شماره موبایل */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2 mr-1">
                  <Phone className="w-4 h-4 text-emerald-500" /> شماره موبایل
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#232936] border border-gray-700/50 rounded-2xl px-5 py-4 text-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono tracking-widest"
                />
              </div>

              <div className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-200">امنیت حساب</h4>
                  <p className="text-[10px] text-gray-400 leading-5">اطلاعات شما به‌صورت رمزنگاری شده ذخیره می‌شود.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-gray-800/30 border-t border-gray-700/50">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full min-w-40 h-14 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#1B1F28] font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> ذخیره تغییرات</>}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}