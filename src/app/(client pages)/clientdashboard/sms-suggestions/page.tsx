// src/app/(client pages)/clientdashboard/sms-suggestions/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  Send,
  FileText,
  User,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Footer from "../components/Footer/Footer";

interface Suggestion {
  id: number;
  title: string;
  content: string;
  type: "reservation" | "reminder" | "bulk" | "other";
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

const typeConfig = {
  reservation: { label: "رزرو نوبت", icon: "📅", color: "text-emerald-400 bg-emerald-500/10" },
  reminder: { label: "یادآوری نوبت", icon: "⏰", color: "text-blue-400 bg-blue-500/10" },
  bulk: { label: "ارسال گروهی", icon: "👥", color: "text-purple-400 bg-purple-500/10" },
  other: { label: "سایر موارد", icon: "📝", color: "text-gray-400 bg-white/5" },
};

const statusConfig = {
  pending: { label: "در انتظار بررسی", color: "text-yellow-400", icon: Clock, bg: "bg-yellow-500/10" },
  approved: { label: "تایید شده", color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-500/10" },
  rejected: { label: "رد شده", color: "text-red-400", icon: XCircle, bg: "bg-red-500/10" },
};

export default function SmsSuggestionsPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "other" as Suggestion["type"],
  });

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/sms-suggestions", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("خطا در دریافت پیشنهادات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("لطفاً عنوان را وارد کنید");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("لطفاً متن پیامک را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/client/sms-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("پیشنهاد شما با موفقیت ثبت شد");
        setIsNewModalOpen(false);
        setFormData({ title: "", content: "", type: "other" });
        fetchSuggestions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در ثبت پیشنهاد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setIsModalOpen(true);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "امروز";
    if (days === 1) return "دیروز";
    if (days < 7) return `${days} روز پیش`;
    return d.toLocaleDateString("fa-IR");
  };

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === "pending").length,
    approved: suggestions.filter(s => s.status === "approved").length,
    rejected: suggestions.filter(s => s.status === "rejected").length,
  };

  return (
 <div className="h-screen text-white overflow-auto max-w-md m-auto">
       {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">پیشنهادات تمپلیت پیامک</h1>
                <p className="text-xs text-gray-400">الگوهای پیامکی پیشنهادی شما</p>
              </div>
            </div>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4  pb-36 pt-6 space-y-6">
        {/* آمار */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-gray-500">کل</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-[10px] text-gray-500">در انتظار</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
            <p className="text-[10px] text-gray-500">تایید شده</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-[10px] text-gray-500">رد شده</p>
          </div>
        </div>

        {/* لیست پیشنهادات */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">هیچ پیشنهادی ثبت نکرده‌اید</p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 px-6 py-2 bg-emerald-500 rounded-xl text-white font-bold"
            >
              ثبت پیشنهاد جدید
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const typeInfo = typeConfig[suggestion.type];
              const statusInfo = statusConfig[suggestion.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal(suggestion)}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-white text-base">{suggestion.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {suggestion.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(suggestion.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 mr-3">
                      <Eye className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال جزئیات پیشنهاد */}
      <AnimatePresence>
        {isModalOpen && selectedSuggestion && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#242933] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">جزئیات پیشنهاد</h2>
                    <p className="text-gray-400 text-xs mt-1">{selectedSuggestion.title}</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* نوع و وضعیت */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${typeConfig[selectedSuggestion.type].color}`}>
                    {typeConfig[selectedSuggestion.type].icon} {typeConfig[selectedSuggestion.type].label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[selectedSuggestion.status].bg} ${statusConfig[selectedSuggestion.status].color} flex items-center gap-1`}>
                    {React.createElement(statusConfig[selectedSuggestion.status].icon, { className: "w-3 h-3" })}
                    {statusConfig[selectedSuggestion.status].label}
                  </span>
                </div>

                {/* متن پیامک */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">متن پیامک پیشنهادی</label>
                  <div className="bg-[#1a1e26] rounded-xl p-4 border border-white/5">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedSuggestion.content}
                    </p>
                  </div>
                </div>

                {/* پیام ادمین (اگر وجود داشته باشد) */}
                {selectedSuggestion.admin_note && (
                  <div className={`rounded-xl p-4 border ${
                    selectedSuggestion.status === "approved" 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400">پیام تیم پشتیبانی</span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedSuggestion.admin_note}
                    </p>
                  </div>
                )}

                {/* تاریخ */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    ثبت: {formatDate(selectedSuggestion.created_at)}
                  </span>
                  {selectedSuggestion.updated_at !== selectedSuggestion.created_at && (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      بروزرسانی: {formatDate(selectedSuggestion.updated_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-white/10">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* مودال ثبت پیشنهاد جدید */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#242933] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">پیشنهاد جدید</h2>
                    <p className="text-gray-400 text-xs mt-1">الگوی پیامکی خود را پیشنهاد دهید</p>
                  </div>
                  <button
                    onClick={() => setIsNewModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* نوع تمپلیت */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">نوع پیامک</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, type: key as Suggestion["type"] })}
                        className={`p-3 rounded-xl text-right transition-all ${
                          formData.type === key
                            ? `${config.color} border border-emerald-500/40`
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-lg mb-1">{config.icon}</div>
                        <div className="text-sm font-bold">{config.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* عنوان */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">عنوان تمپلیت</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: یادآوری نوبت آرایشگاه"
                    className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>

                {/* متن پیامک */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">متن پیامک</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={`متن پیامک خود را وارد کنید...
نکته: برای نام مشتری از %name%، برای تاریخ از %date%، برای ساعت از %time% استفاده کنید.`}
                    rows={6}
                    className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    می‌توانید از متغیرهای %name%، %date%، %time%، %salon% استفاده کنید
                  </p>
                </div>
              </div>

              <div className="p-5 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      ثبت پیشنهاد
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer/>
    </div>
  );
}