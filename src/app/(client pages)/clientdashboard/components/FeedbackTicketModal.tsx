// src/components/FeedbackTicketModal.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageCircle, 
  Send, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Bug,
  Lightbulb,
  ThumbsDown,
  HelpCircle,
  Star,
  Flag
} from "lucide-react";
import { toast } from "react-hot-toast";

interface FeedbackTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { value: "suggestion", label: "پیشنهاد", icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { value: "complaint", label: "انتقاد", icon: ThumbsDown, color: "text-red-400", bg: "bg-red-500/10" },
  { value: "bug", label: "گزارش باگ", icon: Bug, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { value: "feature", label: "درخواست ویژگی جدید", icon: Star, color: "text-purple-400", bg: "bg-purple-500/10" },
  { value: "question", label: "سوال", icon: HelpCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
  { value: "other", label: "سایر", icon: Flag, color: "text-gray-400", bg: "bg-white/5" },
];

const priorities = [
  { value: "low", label: "کم", color: "text-gray-400" },
  { value: "normal", label: "متوسط", color: "text-blue-400" },
  { value: "high", label: "بالا", color: "text-orange-400" },
  { value: "urgent", label: "فوری", color: "text-red-400" },
];

export default function FeedbackTicketModal({ isOpen, onClose }: FeedbackTicketModalProps) {
  const [category, setCategory] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      toast.error("لطفاً عنوان را وارد کنید");
      return;
    }
    if (!message.trim()) {
      toast.error("لطفاً متن پیام را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/client/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message, priority, email: email || undefined }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setSubject("");
          setMessage("");
          setCategory("suggestion");
          setPriority("normal");
          setEmail("");
          setIsSuccess(false);
        }, 2000);
      } else {
        toast.error(data.message || "خطا در ارسال پیام");
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
            className="relative bg-[#1a1e26] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* header */}
            <div className="sticky top-0 z-10 p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1e26]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">ارسال بازخورد</h3>
                  <p className="text-xs text-gray-400 mt-0.5">نظر، انتقاد و پیشنهاد خود را با ما در میان بگذارید</p>
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
                <h4 className="text-lg font-bold text-white mb-2">بازخورد شما ثبت شد!</h4>
                <p className="text-gray-400 text-sm">
                  از اینکه ما را در بهبود اپلیکیشن همراهی می‌کنید سپاسگزاریم.  
                  در اسرع وقت پاسخ شما را بررسی خواهیم کرد.
                </p>
              </div>
            ) : (
              <>
                {/* content */}
                <div className="p-5 space-y-5">
                  {/* دسته‌بندی */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3">دسته‌بندی</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`p-3 rounded-xl text-right transition-all ${
                              isSelected
                                ? `${cat.bg} border border-emerald-500/40`
                                : "bg-white/5 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${isSelected ? cat.color : "text-gray-500"}`} />
                              <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                                {cat.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* اولویت */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">اولویت</label>
                    <div className="flex gap-2">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            priority === p.value
                              ? `${p.color} bg-white/10 border border-white/20`
                              : "text-gray-500 hover:text-gray-300 bg-white/5"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* عنوان */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">عنوان</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="خلاصه‌ای از پیام خود را وارد کنید"
                      className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>

                  {/* ایمیل (اختیاری) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      ایمیل <span className="text-xs text-gray-500">(اختیاری، برای پاسخگویی)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition dir-ltr"
                    />
                  </div>

                  {/* متن پیام */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">متن پیام</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="توضیحات خود را به طور کامل وارد کنید..."
                      rows={5}
                      className="w-full bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
                    />
                  </div>
                </div>

                {/* footer */}
                <div className="sticky bottom-0 p-5 border-t border-white/10 flex gap-3 bg-[#1a1e26]">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        ارسال بازخورد
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