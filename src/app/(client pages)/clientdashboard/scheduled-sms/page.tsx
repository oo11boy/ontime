"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  User,
  Loader2,
  Eye,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useUserType } from "@/hooks/useUserType";
import Footer from "../components/Footer/Footer";

interface ScheduledSms {
  booking_staff_id: number | null;
  staff_name: string | null;
  id: number;
  to_phone: string;
  cost: number;
  sms_type: string;
  scheduled_at: string;
  scheduled_at_persian: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  error_message: string | null;
  created_at_persian: string;
  client_name: string | null;
  booking_date: string | null;
  booking_time: string | null;
  reminder_hours_before: number | null;
  services: string | null;
  booking_id: number | null;
}

const statusConfig = {
  pending: { label: "در انتظار", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10", icon: Clock },
  sent: { label: "ارسال شده", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", icon: CheckCircle },
  failed: { label: "خطا", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/10", icon: XCircle },
  cancelled: { label: "لغو شده", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-white/5", icon: XCircle },
};

const typeLabels = {
  reservation: "تایید رزرو",
  reminder: "یادآوری نوبت",
  cancellation: "لغو نوبت",
  reschedule: "تغییر زمان",
  bulk_customers: "ارسال گروهی به مشتریان",
  bulk_appointments: "ارسال گروهی به نوبت‌ها",
  other: "سایر",
};

export default function ScheduledSmsPage() {
  const router = useRouter();
  const { userType } = useUserType();
  const [scheduledSms, setScheduledSms] = useState<ScheduledSms[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedSms, setSelectedSms] = useState<ScheduledSms | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingSms, setCancelingSms] = useState<ScheduledSms | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchScheduledSms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/client/sms-scheduled?status=${statusFilter}&page=${pagination.page}`
      );
      const data = await res.json();
      if (data.success) {
        setScheduledSms(data.scheduledSms);
        setPagination(data.pagination);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "خطا در دریافت اطلاعات");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page]);

  useEffect(() => {
    fetchScheduledSms();
  }, [fetchScheduledSms]);

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getTypeLabel = (type: string) => {
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatPersianDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const openCancelModal = (sms: ScheduledSms) => {
    setCancelingSms(sms);
    setShowCancelModal(true);
  };

  const handleCancelSms = async () => {
    if (!cancelingSms) return;
    
    setIsCanceling(true);
    try {
      const res = await fetch("/api/client/sms-scheduled/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsLogId: cancelingSms.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`پیامک لغو شد. ${data.refundedCost} واحد پیامک به حساب شما برگشت.`);
        setShowCancelModal(false);
        setCancelingSms(null);
        fetchScheduledSms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در لغو پیامک");
    } finally {
      setIsCanceling(false);
    }
  };

  const stats = {
    pending: scheduledSms.filter((s) => s.status === "pending").length,
    sent: scheduledSms.filter((s) => s.status === "sent").length,
    failed: scheduledSms.filter((s) => s.status === "failed").length,
  };

  return (
    <div className="h-screen overflow-auto max-w-md m-auto bg-slate-50 dark:bg-[#1a1e26] transition-colors">
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1e26]/90 backdrop-blur-xl border-b border-slate-200 dark:border-emerald-500/30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.back()}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-white" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">پیامک‌های زمان‌بندی شده</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 hidden sm:block">وضعیت یادآوری‌های نوبت</p>
              </div>
            </div>
            <button
              onClick={() => fetchScheduledSms()}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-36 pt-4 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">در انتظار</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.sent}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">ارسال شده</p>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">خطا</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {["pending", "sent", "failed", "cancelled"].map((status) => {
            const info = getStatusInfo(status);
            const Icon = info.icon;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                  statusFilter === status
                    ? `${info.bg} ${info.color} border border-white/20`
                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{info.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12 sm:py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : scheduledSms.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-slate-500 dark:text-gray-500">هیچ پیامکی در این وضعیت وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {scheduledSms.map((sms) => {
              const statusInfo = getStatusInfo(sms.status);
              const StatusIcon = statusInfo.icon;
              const isFailed = sms.status === "failed";
              const isPending = sms.status === "pending";
              const isScheduled = sms.scheduled_at && new Date(sms.scheduled_at) > new Date();

              return (
                <motion.div
                  key={sms.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSms(sms);
                    setShowDetailModal(true);
                  }}
                  className={`bg-white dark:bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer ${
                    isFailed
                      ? "border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/50"
                      : "border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                        <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                          <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden xs:inline">{statusInfo.label}</span>
                        </span>
                        <span className="text-[8px] sm:text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 px-1.5 sm:px-2 py-0.5 rounded-full">
                          {getTypeLabel(sms.sms_type)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-gray-500 shrink-0" />
                        <span className="text-slate-800 dark:text-white dir-ltr text-xs sm:text-sm break-all">{sms.to_phone}</span>
                      </div>

                      {sms.client_name && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-gray-500 shrink-0" />
                          <span className="text-slate-600 dark:text-gray-300 truncate">{sms.client_name}</span>
                        </div>
                      )}

                      {sms.booking_date && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 dark:text-gray-500 shrink-0" />
                          <span className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm">
                            {new Date(sms.booking_date).toLocaleDateString("fa-IR")} - {sms.booking_time}
                          </span>
                          {sms.reminder_hours_before && sms.reminder_hours_before > 0 && (
                            <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full whitespace-nowrap">
                              {sms.reminder_hours_before === 24 ? "۱ روز قبل" : `${sms.reminder_hours_before} ساعت قبل`}
                            </span>
                          )}
                        </div>
                      )}

                      {userType === "user" && sms.booking_staff_id && sms.staff_name && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                          <span className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm">
                            ثبت کننده: {sms.staff_name}
                          </span>
                        </div>
                      )}

                      {isFailed && sms.error_message && (
                        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1.5 line-clamp-1">
                          خطا: {sms.error_message}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          زمان ارسال:
                          {isScheduled ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{sms.scheduled_at_persian}</span>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">بلافاصله</span>
                          )}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">{sms.cost} واحد</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCancelModal(sms);
                          }}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 transition active:scale-95"
                          title="لغو پیامک"
                        >
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-white" />
            </button>
            <span className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              صفحه {pagination.page} از {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-white" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDetailModal && selectedSms && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#242933] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto shadow-xl dark:shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-[#242933] p-4 sm:p-5 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">جزئیات پیامک</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">شماره گیرنده</p>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-white dir-ltr break-all">{selectedSms.to_phone}</p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">نوع پیامک</p>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-white">{getTypeLabel(selectedSms.sms_type)}</p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">وضعیت</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedSms.status === "sent" ? "bg-emerald-500" :
                      selectedSms.status === "failed" ? "bg-red-500" :
                      selectedSms.status === "pending" ? "bg-yellow-500" : "bg-gray-500"
                    }`} />
                    <span className="text-sm sm:text-base text-slate-800 dark:text-white">
                      {statusConfig[selectedSms.status as keyof typeof statusConfig]?.label || selectedSms.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">زمان ایجاد</p>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-white">{selectedSms.created_at_persian}</p>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">زمان ارسال برنامه‌ریزی شده</p>
                  <p className="text-sm sm:text-base text-slate-800 dark:text-white">{selectedSms.scheduled_at_persian || "بلافاصله"}</p>
                </div>

                {selectedSms.client_name && (
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">مشتری</p>
                    <p className="text-sm sm:text-base text-slate-800 dark:text-white">{selectedSms.client_name}</p>
                  </div>
                )}

                {selectedSms.booking_date && (
                  <div className="space-y-1 sm:space-y-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400">نوبت مربوطه</p>
                    <p className="text-sm sm:text-base text-slate-800 dark:text-white">
                      {formatPersianDate(selectedSms.booking_date)} - {selectedSms.booking_time}
                    </p>
                    {selectedSms.reminder_hours_before && (
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400">
                        یادآوری {selectedSms.reminder_hours_before === 24 ? "۱ روز" : `${selectedSms.reminder_hours_before} ساعت`} قبل از نوبت
                      </p>
                    )}
                    {selectedSms.services && (
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mt-1 break-words">{selectedSms.services}</p>
                    )}
                  </div>
                )}

                {selectedSms.error_message && (
                  <div className="space-y-1 sm:space-y-2 p-2 sm:p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">خطا</p>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 break-words">{selectedSms.error_message}</p>
                  </div>
                )}

                <div className="space-y-1 sm:space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500">تعداد واحد مصرفی</p>
                  <p className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-bold">{selectedSms.cost} واحد</p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-[#242933] p-4 sm:p-5 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold transition active:scale-95"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && cancelingSms && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#242933] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl w-full max-w-sm shadow-xl dark:shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">
                  لغو پیامک
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 mb-4">
                  آیا از لغو این پیامک اطمینان دارید؟
                </p>

                <div className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 mb-4 text-right">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mb-1">
                    گیرنده:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-white font-mono mb-2">
                    {cancelingSms.to_phone}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mb-1">
                    نوع پیامک:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-white mb-2">
                    {getTypeLabel(cancelingSms.sms_type)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 mb-1">
                    زمان ارسال برنامه‌ریزی شده:
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    {cancelingSms.scheduled_at_persian}
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-2 mb-4 border border-emerald-200 dark:border-emerald-500/20">
                  <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    اعتبار پیامک به حساب شما بازگردانده می‌شود
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelingSms(null);
                    }}
                    className="flex-1 py-2 sm:py-2.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition active:scale-95"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleCancelSms}
                    disabled={isCanceling}
                    className="flex-1 py-2 sm:py-2.5 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        در حال لغو...
                      </>
                    ) : (
                      "بله، لغو شود"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}