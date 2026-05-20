// src/app/(admin pages)/admindashboard/sms-suggestions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Calendar,
  User,
  Phone,
  AlertCircle,
  Send,
  Bell,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  title: string;
  content: string;
  type: "reservation" | "reminder" | "bulk" | "other";
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

// کدهای پترن
const PATTERNS = {
  APPROVED: "5t8vv8z4ltnlk47",
  REJECTED: "ldr2c07a937fxbk",
};

const typeLabels = {
  reservation: "رزرو نوبت",
  reminder: "یادآوری نوبت",
  bulk: "ارسال گروهی",
  other: "سایر موارد",
};

const typeColors = {
  reservation: "text-emerald-400 bg-emerald-500/10",
  reminder: "text-blue-400 bg-blue-500/10",
  bulk: "text-purple-400 bg-purple-500/10",
  other: "text-gray-400 bg-white/5",
};

const statusConfig = {
  pending: { label: "در انتظار بررسی", color: "text-yellow-400 bg-yellow-500/10", icon: Clock },
  approved: { label: "تایید شده", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle },
  rejected: { label: "رد شده", color: "text-red-400 bg-red-500/10", icon: XCircle },
};

export default function SmsSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"approved" | "rejected" | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sms-suggestions");
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در دریافت پیشنهادات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // تابع ارسال پیامک با پترن
  const sendPatternSms = async (
    phone: string,
    patternCode: string,
    variables: Record<string, string>,
    suggestionId: number,
    action: string
  ) => {
    try {
      const res = await fetch("/api/admin/send-pattern-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          patternCode,
          variables,
          suggestionId,
          action,
        }),
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  };

  const handleUpdateStatus = async (id: number, status: "approved" | "rejected", sendSms: boolean = true) => {
    if (status === "rejected" && !adminNote.trim()) {
      toast.error("لطفاً دلیل رد را وارد کنید");
      return;
    }

    setIsProcessing(true);
    
    try {
      // 1. ابتدا وضعیت پیشنهاد را به‌روزرسانی کنید
      const res = await fetch("/api/admin/sms-suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, admin_note: adminNote || null }),
      });
      const data = await res.json();
      
      if (data.success) {
        // 2. اگر کاربر درخواست ارسال پیامک داشته باشد
        if (sendSms && selectedSuggestion && selectedSuggestion.user_phone) {
          const patternCode = status === "approved" ? PATTERNS.APPROVED : PATTERNS.REJECTED;
          
          // آماده سازی متغیرهای پیامک
          const variables: Record<string, string> = {
            name: selectedSuggestion.user_name || "کاربر گرامی",
            title: selectedSuggestion.title,
          };
          
          // اگر رد شده و دلیل وجود دارد، به متغیرها اضافه کن
          if (status === "rejected" && adminNote) {
            variables.reason = adminNote;
          }
          
          const smsSent = await sendPatternSms(
            selectedSuggestion.user_phone,
            patternCode,
            variables,
            selectedSuggestion.id,
            status
          );
          
          if (smsSent) {
            toast.success(`✅ پیامک ${status === "approved" ? "تایید" : "رد"} برای کاربر ارسال شد`);
          } else {
            toast.success(`⚠️ پیشنهاد ${status === "approved" ? "تایید" : "رد"} شد اما ارسال پیامک با مشکل مواجه شد`);
          }
        } else if (!sendSms) {
          toast.success(`پیشنهاد با موفقیت ${status === "approved" ? "تایید" : "رد"} شد (بدون ارسال پیامک)`);
        } else {
          toast.success(data.message);
        }
        
        // بستن مودال‌ها و ریست کردن state
        setIsModalOpen(false);
        setShowConfirmModal(false);
        setSelectedSuggestion(null);
        setAdminNote("");
        setPendingAction(null);
        
        // رفرش لیست
        fetchSuggestions();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating suggestion:", error);
      toast.error("خطا در بروزرسانی");
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNote(suggestion.admin_note || "");
    setIsModalOpen(true);
  };

  const showConfirmation = (action: "approved" | "rejected") => {
    if (action === "rejected" && !adminNote.trim()) {
      toast.error("لطفاً دلیل رد را وارد کنید");
      return;
    }
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const getTypeLabel = (type: string) => {
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || typeColors.other;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const pendingCount = suggestions.filter(s => s.status === "pending").length;

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header -保持不变 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-400 w-7 h-7" />
            پیشنهادات تمپلیت پیامک
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت و بررسی پیشنهادات کاربران برای الگوهای پیامکی جدید
          </p>
        </div>
        <button
          onClick={fetchSuggestions}
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          بروزرسانی
        </button>
      </div>

      {/* Stats -保持不变 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">کل پیشنهادات</p>
          <p className="text-2xl font-bold text-white">{suggestions.length}</p>
        </div>
        <div className="bg-[#242933] border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">در انتظار بررسی</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">تایید شده</p>
          <p className="text-2xl font-bold text-emerald-400">
            {suggestions.filter(s => s.status === "approved").length}
          </p>
        </div>
        <div className="bg-[#242933] border border-red-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">رد شده</p>
          <p className="text-2xl font-bold text-red-400">
            {suggestions.filter(s => s.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Suggestions List -保持不变 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#242933]/50 rounded-2xl border border-dashed border-gray-700">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>هیچ پیشنهادی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const StatusIcon = statusConfig[suggestion.status].icon;
            const typeColorClass = getTypeColor(suggestion.type);
            
            return (
              <div
                key={suggestion.id}
                className="bg-[#242933] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/40 transition-all cursor-pointer"
                onClick={() => openModal(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{suggestion.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColorClass}`}>
                        {getTypeLabel(suggestion.type)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[suggestion.status].color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[suggestion.status].label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {suggestion.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {suggestion.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {suggestion.user_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(suggestion.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 mr-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal بررسی پیشنهاد */}
      <AnimatePresence>
        {isModalOpen && selectedSuggestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#242933] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">بررسی پیشنهاد</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {selectedSuggestion.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* اطلاعات کاربر */}
                <div className="bg-[#1a1e26] rounded-xl p-4 space-y-2">
                  <p className="text-xs text-gray-500">اطلاعات ارسال‌کننده</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-white text-sm">{selectedSuggestion.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-white text-sm" dir="ltr">{selectedSuggestion.user_phone}</span>
                    </div>
                  </div>
                </div>

                {/* متن پیشنهاد */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">متن پیامک پیشنهادی</label>
                  <div className="bg-[#1a1e26] rounded-xl p-4 border border-white/5">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedSuggestion.content}
                    </p>
                  </div>
                </div>

                {/* یادداشت ادمین */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">
                    یادداشت (در صورت رد، دلیل را وارد کنید)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="توضیحات خود را وارد کنید..."
                    rows={3}
                    className="w-full bg-[#1a1e26] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                {selectedSuggestion.status === "pending" ? (
                  <>
                    <button
                      onClick={() => showConfirmation("rejected")}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 inline ml-2" />
                      رد پیشنهاد
                    </button>
                    <button
                      onClick={() => showConfirmation("approved")}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline ml-2" />
                      تایید و اضافه به تمپلیت‌ها
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition"
                  >
                    بستن
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal تایید ارسال پیامک */}
      <AnimatePresence>
        {showConfirmModal && pendingAction && selectedSuggestion && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#242933] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    pendingAction === "approved" ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                    {pendingAction === "approved" ? (
                      <Bell className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {pendingAction === "approved" ? "تایید پیشنهاد" : "رد پیشنهاد"}
                  </h3>
                  <p className="text-gray-400">
                    آیا مایل به ارسال پیامک اطلاع‌رسانی به کاربر هستید؟
                  </p>
                  {pendingAction === "rejected" && adminNote && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-xl text-right">
                      <p className="text-red-400 text-xs">دلیل رد:</p>
                      <p className="text-white text-sm mt-1">{adminNote}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingAction(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      if (pendingAction) {
                        handleUpdateStatus(selectedSuggestion.id, pendingAction, false);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition"
                  >
                    فقط {pendingAction === "approved" ? "تایید" : "رد"} کن
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      if (pendingAction) {
                        handleUpdateStatus(selectedSuggestion.id, pendingAction, true);
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                      pendingAction === "approved"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    ارسال پیامک و {pendingAction === "approved" ? "تایید" : "رد"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}