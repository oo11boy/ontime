// src/components/SmsTemplateSuggestionModal.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageSquare, 
  Send, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Calendar,
  Users,
  HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SmsTemplateSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const templateTypes = [
  { value: "reservation", label: "پیامک رزرو نوبت", icon: Calendar, desc: "برای تایید و یادآوری نوبت" },
  { value: "reminder", label: "یادآوری نوبت", icon: Calendar, desc: "یادآوری چند ساعت قبل از نوبت" },
  { value: "bulk", label: "ارسال گروهی", icon: Users, desc: "برای ارسال همگانی به مشتریان" },
  { value: "other", label: "سایر موارد", icon: HelpCircle, desc: "انواع دیگر پیامک‌ها" },
];

export default function SmsTemplateSuggestionModal({ isOpen, onClose }: SmsTemplateSuggestionModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("other");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("لطفاً عنوان پیامک را وارد کنید");
      return;
    }
    if (!content.trim()) {
      toast.error("لطفاً متن پیامک را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/client/sms-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setTitle("");
          setContent("");
          setType("other");
          setIsSuccess(false);
        }, 2000);
      } else {
        toast.error(data.message || "خطا در ارسال پیشنهاد");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1e26] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            {/* header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">پیشنهاد تمپلیت پیامک</h3>
                  <p className="text-xs text-gray-400 mt-0.5">الگوی پیامکی خود را پیشنهاد دهید</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">پیشنهاد شما ثبت شد!</h4>
                <p className="text-gray-400 text-sm">
                  از مشارکت شما سپاسگزاریم. پیشنهاد شما توسط تیم بررسی خواهد شد و در صورت تایید به تمپلیت‌ها اضافه می‌شود.
                </p>
              </div>
            ) : (
              <>
                {/* content */}
                <div className="p-5 space-y-4">
                  {/* نوع تمپلیت */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">نوع پیامک</label>
                    <div className="grid grid-cols-2 gap-2">
                      {templateTypes.map((t) => {
                        const Icon = t.icon;
                        const isSelected = type === t.value;
                        return (
                          <button
                            key={t.value}
                            onClick={() => setType(t.value)}
                            className={`p-3 rounded-xl text-right transition-all ${
                              isSelected
                                ? "bg-emerald-500/20 border border-emerald-500/40"
                                : "bg-white/5 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-gray-500"}`} />
                              <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                                {t.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500">{t.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* عنوان */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">عنوان تمپلیت</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: یادآوری نوبت آرایشگاه"
                      className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>

                  {/* متن پیامک */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">متن پیامک</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
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

                {/* footer */}
                <div className="p-5 border-t border-white/10 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ثبت پیشنهاد
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}