"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Save,
  Loader2,
  UserCircle,
  Briefcase,
  Building2,
  MapPin,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  CalendarOff,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_OF_WEEK = [
  { id: 0, name: "شنبه" },
  { id: 1, name: "یک‌شنبه" },
  { id: 2, name: "دوشنبه" },
  { id: 3, name: "سه‌شنبه" },
  { id: 4, name: "چهارشنبه" },
  { id: 5, name: "پنج‌شنبه" },
  { id: 6, name: "جمعه" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

// تعریف interface برای تَب‌های اکاردئونی
interface AccordionTab {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  content: React.ReactNode;
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams(); // اضافه شد
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([]);
const [openTabs, setOpenTabs] = useState<number[]>([1]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    job_id: "",
    business_name: "",
    business_address: "",
    work_shifts: [] as { start: string; end: string }[],
    off_days: [] as number[],
  });
useEffect(() => {
  const tab = searchParams.get("tab");
  let targetId: string | null = null;

  if (tab === "shifts") {
    setOpenTabs([2]);
    targetId = "tab-2";
  } else if (tab === "holidays") {
    setOpenTabs([3]);
    targetId = "tab-3";
  } else {
    setOpenTabs([1]);
  }

  if (targetId) {
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // جبران هدر ثابت (sticky header)
        window.scrollBy(0, -100);
      }
    }, 400);
  }
}, [searchParams]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPageLoading(true);
        const [jobsRes, userRes] = await Promise.all([
          fetch("/api/client/jobs/list"),
          fetch("/api/client/settings"),
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
            business_address: userData.user.business_address || "",
            work_shifts: userData.user.work_shifts
              ? JSON.parse(userData.user.work_shifts)
              : [],
            off_days: userData.user.off_days
              ? JSON.parse(userData.user.off_days)
              : [],
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

  const addShift = () => {
    if (formData.work_shifts.length >= 3)
      return toast.error("حداکثر ۳ شیفت مجاز است");
    setFormData((prev) => ({
      ...prev,
      work_shifts: [...prev.work_shifts, { start: "09:00", end: "17:00" }],
    }));
  };

  const removeShift = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_shifts: prev.work_shifts.filter((_, i) => i !== index),
    }));
  };

  const updateShift = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newShifts = [...formData.work_shifts];
    newShifts[index][field] = value;
    setFormData((prev) => ({ ...prev, work_shifts: newShifts }));
  };

  const toggleOffDay = (dayId: number) => {
    setFormData((prev) => ({
      ...prev,
      off_days: prev.off_days.includes(dayId)
        ? prev.off_days.filter((id) => id !== dayId)
        : [...prev.off_days, dayId],
    }));
  };

  const toggleTab = (tabId: number) => {
    setOpenTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.job_id) {
      toast.error("نام و تخصص الزامی است");
      return;
    }

    setIsSaving(true);
    const finalShifts =
      formData.work_shifts.length === 0
        ? [{ start: "08:00", end: "22:00" }]
        : formData.work_shifts;

    try {
      const res = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          work_shifts: JSON.stringify(finalShifts),
          off_days: JSON.stringify(formData.off_days),
        }),
      });

      if (res.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد");
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } else {
        toast.error("خطا در ذخیره‌سازی");
      }
    } catch (error) {
      toast.error("خطا در اتصال");
    } finally {
      setIsSaving(false);
    }
  };

  // محتوای تَب‌ها
  const accordionTabs: AccordionTab[] = [
    {
      id: 1,
      title: "هویت و اطلاعات تماس",
      icon: <Building2 size={18} />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      content: (
        <div className="space-y-4 p-2">
          <div className="relative group">
            <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
            <input
              type="text"
              placeholder="نام و نام خانوادگی"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pr-12 pl-6 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all font-bold backdrop-blur-sm"
            />
          </div>

          <div className="relative opacity-70">
            <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 size-4" />
            <input
              type="tel"
              value={formData.phone}
              readOnly
              className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pr-12 pl-6 py-3 text-sm font-mono tracking-widest cursor-not-allowed"
            />
          </div>

          <input
            type="text"
            placeholder="نام تجاری بیزنس"
            value={formData.business_name}
            onChange={(e) =>
              setFormData({ ...formData, business_name: e.target.value })
            }
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-6 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all font-bold backdrop-blur-sm"
          />

          <div className="relative">
            <MapPin className="absolute right-5 top-4 text-slate-500 size-4" />
            <textarea
              placeholder="آدرس دقیق جهت ارسال پیامک به مشتری..."
              value={formData.business_address}
              onChange={(e) =>
                setFormData({ ...formData, business_address: e.target.value })
              }
              rows={2}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pr-12 pl-6 py-3 text-sm focus:border-emerald-500/50 outline-none transition-all resize-none backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <select
              value={formData.job_id}
              onChange={(e) =>
                setFormData({ ...formData, job_id: e.target.value })
              }
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-6 py-3 text-sm appearance-none focus:border-emerald-500/50 outline-none font-bold text-slate-300 backdrop-blur-sm"
            >
              <option value="" disabled>
                انتخاب تخصص...
              </option>
              {jobs.map((j) => (
                <option
                  key={j.id}
                  value={j.id.toString()}
                  className="bg-[#0c111d] text-white"
                >
                  {j.name}
                </option>
              ))}
            </select>
            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/50 size-4 pointer-events-none" />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "زمان‌بندی فعالیت",
      icon: <Clock size={18} />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      content: (
        <div className="space-y-4 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">مدیریت شیفت‌های کاری</span>
            <button
              type="button"
              onClick={addShift}
              className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500 hover:text-black transition-all"
            >
              <Plus size={12} /> شیفت جدید
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {formData.work_shifts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-dashed border-white/10 rounded-xl text-center bg-white/[0.01]"
                >
                  <p className="text-[11px] text-slate-500 italic">
                    شیفت دستی انتخاب نشده؛ نوبت‌دهی خودکار{" "}
                    <span className="text-blue-400 font-bold">
                      ۰۸:۰۰ الی ۲۲:۰۰
                    </span>
                  </p>
                </motion.div>
              ) : (
                formData.work_shifts.map((shift, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white/[0.03] p-3 rounded-xl border border-white/10 flex items-center gap-3 backdrop-blur-sm"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <select
                        value={shift.start}
                        onChange={(e) =>
                          updateShift(index, "start", e.target.value)
                        }
                        className="bg-[#0a0c10] border border-white/5 rounded-lg py-2 text-center text-xs font-bold outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <select
                        value={shift.end}
                        onChange={(e) =>
                          updateShift(index, "end", e.target.value)
                        }
                        className="bg-[#0a0c10] border border-white/5 rounded-lg py-2 text-center text-xs font-bold outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeShift(index)}
                      className="p-1.5 text-red-500/50 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "تعطیلات هفتگی",
      icon: <CalendarOff size={18} />,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      content: (
        <div className="space-y-4 p-2">
          <div className="mb-2">
            <span className="text-xs text-slate-500">
              روزهای غیرفعال هفته را انتخاب کنید
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isOff = formData.off_days.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleOffDay(day.id)}
                  className={`py-2.5 rounded-lg text-[10px] font-black transition-all border ${
                    isOff
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10"
                      : "bg-white/[0.02] text-slate-500 border-white/[0.08] hover:bg-white/[0.05]"
                  }`}
                >
                  {day.name}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-600 text-center pt-2">
            روزهای انتخاب شده به عنوان تعطیل نمایش داده می‌شوند
          </p>
        </div>
      ),
    },
  ];

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05070a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-t-2 border-emerald-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-200 max-w-lg mx-auto bg-[#05070a] font-sans pb-32"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-[#05070a]/80 backdrop-blur-2xl border-b border-white/[0.03] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/[0.08]">
            <UserCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">تنظیمات پیشرفته</h1>
            <p className="text-[10px] text-emerald-500/60 font-bold tracking-[2px]">
              CONFIG 2026
            </p>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-white/20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 py-8"
      >
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 mb-2">
            مدیریت تنظیمات
          </h2>
          <p className="text-xs text-slate-600">
            هر بخش را باز کرده و تنظیمات مورد نظر را ویرایش کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* تَب‌های اکاردئونی */}
          {accordionTabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={false}
              animate={{ scale: openTabs.includes(tab.id) ? 1 : 0.98 }}
              className="rounded-2xl overflow-hidden"
            >
              <button
              id={`tab-${tab.id}`}
                type="button"
                onClick={() => toggleTab(tab.id)}
                className={`w-full p-5 flex items-center justify-between transition-all ${
                  openTabs.includes(tab.id) ? "rounded-t-2xl" : "rounded-2xl"
                } ${tab.bgColor} border ${tab.borderColor} backdrop-blur-sm`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${tab.bgColor} border ${tab.borderColor} flex items-center justify-center`}
                  >
                    <span className={tab.color}>{tab.icon}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-white">
                      {tab.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {openTabs.includes(tab.id)
                        ? "برای بستن کلیک کنید"
                        : "برای باز کردن کلیک کنید"}
                    </p>
                  </div>
                </div>
                <div
                  className={`transition-transform duration-300 ${
                    openTabs.includes(tab.id) ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className={`w-5 h-5 ${tab.color}`} />
                </div>
              </button>

              <AnimatePresence>
                {openTabs.includes(tab.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`overflow-hidden ${tab.bgColor} border-x border-b ${tab.borderColor} rounded-b-2xl`}
                  >
                    <div className="p-4">{tab.content}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* دکمه ذخیره */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#05070a] via-[#05070a]/90 to-transparent z-[110]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="w-full max-w-md mx-auto h-16 bg-emerald-500  text-black font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save size={20} />
                  تایید و ثبت تغییرات
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
