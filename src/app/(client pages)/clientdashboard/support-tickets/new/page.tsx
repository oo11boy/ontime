"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

const categories = [
  { value: "suggestion", label: "پیشنهاد", icon: "💡", desc: "پیشنهاد خود را برای بهبود اپلیکیشن مطرح کنید" },
  { value: "complaint", label: "انتقاد", icon: "👎", desc: "نظرات و انتقادات خود را بیان کنید" },
  { value: "bug", label: "گزارش باگ", icon: "🐛", desc: "مشکلات فنی و باگ‌های اپلیکیشن را گزارش دهید" },
  { value: "feature", label: "درخواست ویژگی", icon: "⭐", desc: "ویژگی‌های جدیدی که دوست دارید اضافه شود" },
  { value: "question", label: "سوال", icon: "❓", desc: "سوالات خود را بپرسید" },
  { value: "other", label: "سایر", icon: "📝", desc: "سایر موارد" },
];

const priorities = [
  { value: "low", label: "کم", color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-500/10" },
  { value: "normal", label: "متوسط", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { value: "high", label: "بالا", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
  { value: "urgent", label: "فوری", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "suggestion",
    subject: "",
    message: "",
    priority: "normal",
    email: "",
  });

  const handleSubmit = async () => {
    if (!formData.subject.trim()) {
      toast.error("لطفاً عنوان را وارد کنید");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("لطفاً متن پیام را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/client/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تیکت شما با موفقیت ثبت شد");
        router.push("/clientdashboard/support-tickets");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در ثبت تیکت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-auto max-w-md m-auto mb-10 bg-slate-50 dark:bg-[#1a1e26] transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1e26]/90 backdrop-blur-xl border-b border-slate-200 dark:border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">تیکت جدید</h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">ثبت درخواست، پیشنهاد یا گزارش مشکل</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* دسته‌بندی */}
        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">دسته‌بندی</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`p-4 rounded-xl text-right transition-all ${
                  formData.category === cat.value
                    ? "bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40"
                    : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">{cat.label}</div>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* اولویت */}
        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-3">اولویت</label>
          <div className="flex gap-3">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => setFormData({ ...formData, priority: p.value })}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                  formData.priority === p.value
                    ? `${p.color} ${p.bg} border border-white/20`
                    : "bg-white dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ایمیل (اختیاری) */}
        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">
            ایمیل <span className="text-xs text-slate-500 dark:text-gray-500">(اختیاری، برای پاسخگویی)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition dir-ltr"
          />
        </div>

        {/* عنوان */}
        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">عنوان</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="خلاصه‌ای از پیام خود را وارد کنید"
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        {/* متن پیام */}
        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">متن پیام</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="توضیحات خود را به طور کامل وارد کنید..."
            rows={8}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
          />
        </div>

        {/* دکمه ارسال */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                ثبت تیکت
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}