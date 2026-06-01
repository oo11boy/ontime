"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  Phone,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  X,
  Scissors,
  Package,
  AlertCircle,
  Zap,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { formatPersianDate } from "@/lib/date-utils";
import { useSmsBalance } from "@/hooks/useSmsBalance";

// Interface BookingChange
interface BookingChange {
  id: number;
  client_name: string;
  client_phone: string;
  old_date: string;
  old_time: string;
  new_date: string | null;
  new_time: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  request_type: "reschedule" | "cancel" | "new_booking" | "active_booking";
  reason: string | null;
  admin_reason: string | null;
  requested_at: string;
  booking_id: number;
  staff_id: number | null;
  staff_name: string | null;
  business_name: string;
  business_phone: string;
  cancelled_by?: "customer" | "admin" | null;
  current_status?: string;
  service_name?: string | null;
  services?: string | null;
}

const formatTime = (time: string): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return time;
};

const formatGregorianToPersian = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return formatPersianDate(dateStr);
    }
    const date = new Date(dateStr);
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
    );
    const year = utcDate.getUTCFullYear();
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = utcDate.getUTCDate().toString().padStart(2, "0");
    return formatPersianDate(`${year}-${month}-${day}`);
  } catch {
    return dateStr;
  }
};

const formatPersianDateWithTime = (date: string, time: string): string => {
  return `${formatGregorianToPersian(date)} - ${formatTime(time)}`;
};

const formatRequestDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// تابع کمکی برای نمایش سرویس
const getServiceDisplay = (change: BookingChange): string | null => {
  if (change.service_name && change.service_name.trim()) {
    return change.service_name;
  }
  if (change.services && change.services.trim()) {
    try {
      const services = JSON.parse(change.services);
      if (Array.isArray(services) && services.length > 0) {
        if (services.length === 1) return services[0];
        return `${services[0]} +${services.length - 1} سرویس دیگر`;
      }
    } catch (e) {
      return change.services;
    }
  }
  return null;
};

// تابع دریافت لیست کامل سرویس‌ها برای مودال
const getFullServicesList = (change: BookingChange): string[] => {
  if (change.service_name && change.service_name.trim()) {
    return [change.service_name];
  }
  if (change.services && change.services.trim()) {
    try {
      const services = JSON.parse(change.services);
      if (Array.isArray(services)) return services;
    } catch (e) {
      return [change.services];
    }
  }
  return [];
};

const StatCard = ({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon?: React.ElementType;
}) => (
  <div
    className={`bg-white dark:bg-[#1a1d24] rounded-xl p-3 border ${color} transition-all hover:scale-105 active:scale-95`}
  >
    <div className="flex items-center justify-between">
      <p className="text-slate-500 dark:text-gray-400 text-xs">{label}</p>
      {Icon && <Icon className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
    </div>
    <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
      {value}
    </p>
  </div>
);

const getCancelledByLabel = (change: BookingChange) => {
  if (change.request_type !== "cancel") return null;
  if (change.cancelled_by === "customer") {
    return {
      text: "لغو توسط مشتری",
      className:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400",
    };
  }
  if (change.cancelled_by === "admin") {
    return {
      text: "لغو توسط مدیر",
      className:
        "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400",
    };
  }
  return null;
};

const ChangeCard = ({
  change,
  onReview,
  onDirectCancel,
}: {
  change: BookingChange;
  onReview: () => void;
  onDirectCancel?: (
    bookingId: number,
    clientName: string,
    clientPhone: string,
  ) => void;
}) => {
  const isReschedule = change.request_type === "reschedule";
  const isNewBooking = change.request_type === "new_booking";
  const isActiveBooking = change.request_type === "active_booking";
  const isCancel = change.request_type === "cancel";
  const isPending = change.status === "pending";
  const cancelledByInfo = getCancelledByLabel(change);
  const serviceDisplay = getServiceDisplay(change);

  const canDirectCancel = isActiveBooking && change.current_status === "active";

  const getStatusStyle = () => {
    if (change.status === "pending")
      return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    if (change.status === "approved")
      return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getStatusLabel = () => {
    if (change.status === "pending") return "در انتظار تایید";
    if (change.status === "approved") {
      if (isReschedule) return "تغییر تایید شده";
      if (isCancel) return "لغو تایید شده";
      if (isNewBooking) return "نوبت تایید شده";
      if (isActiveBooking) return "نوبت فعال";
      return "تایید شده";
    }
    return "رد شده";
  };

  const getRequestTypeLabel = () => {
    if (isReschedule) return "تغییر زمان";
    if (isCancel) return "لغو نوبت";
    if (isNewBooking) return "ثبت نوبت جدید";
    if (isActiveBooking) return "نوبت فعال";
    return "سایر";
  };

  const getRequestTypeStyle = () => {
    if (isReschedule)
      return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (isCancel)
      return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400";
    if (isNewBooking)
      return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400";
    if (isActiveBooking)
      return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-[#1a1d24] rounded-xl p-4 border border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusStyle()}`}
          >
            {getStatusLabel()}
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getRequestTypeStyle()}`}
          >
            {getRequestTypeLabel()}
          </span>
          {cancelledByInfo && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cancelledByInfo.className}`}
            >
              {cancelledByInfo.text}
            </span>
          )}
        </div>
        {isPending && (
          <button
            onClick={onReview}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition active:scale-95"
          >
            بررسی
          </button>
        )}
      </div>

      {/* اطلاعات مشتری */}
      <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-slate-500 dark:text-gray-500" />
          <span className="text-slate-800 dark:text-white">
            {change.client_name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4 text-slate-500 dark:text-gray-500" />
          <span className="text-slate-500 dark:text-gray-400 text-xs" dir="ltr">
            {change.client_phone}
          </span>
        </div>
      </div>

      {/* نمایش سرویس */}
      {serviceDisplay && (
        <div className="flex items-center gap-2 text-sm mb-3 bg-slate-100 dark:bg-white/5 rounded-lg p-2">
          <Scissors className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-700 dark:text-gray-300 text-xs font-medium">
            {serviceDisplay}
          </span>
        </div>
      )}

      {/* اطلاعات زمان */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-100 dark:bg-black/30 rounded-lg p-2">
          <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-1">
            {isNewBooking ? "تاریخ درخواستی" : "تاریخ نوبت"}
          </p>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500 dark:text-gray-500" />
            <span className="text-slate-800 dark:text-white text-xs">
              {formatPersianDateWithTime(change.old_date, change.old_time)}
            </span>
          </div>
        </div>

        {isReschedule && change.new_date && change.new_time && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-2 border border-emerald-200 dark:border-emerald-500/20">
            <p className="text-emerald-700 dark:text-emerald-400 text-[10px] mb-1">
              زمان جدید درخواستی
            </p>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300 text-xs">
                {formatPersianDateWithTime(change.new_date, change.new_time)}
              </span>
            </div>
          </div>
        )}

        {isCancel && change.cancelled_by && (
          <div
            className={`rounded-lg p-2 ${change.cancelled_by === "customer" ? "bg-purple-50 dark:bg-purple-500/10" : "bg-orange-50 dark:bg-orange-500/10"}`}
          >
            <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-1">
              نحوه لغو
            </p>
            <p
              className={`text-xs ${change.cancelled_by === "customer" ? "text-purple-700 dark:text-purple-300" : "text-orange-700 dark:text-orange-300"}`}
            >
              {change.cancelled_by === "customer" ? "توسط مشتری" : "توسط مدیر"}
            </p>
          </div>
        )}
      </div>

      {/* دلیل درخواست */}
      {change.reason && (
        <div className="bg-slate-100 dark:bg-gray-500/10 rounded-lg p-2 mb-2">
          <p className="text-slate-500 dark:text-gray-500 text-[10px] mb-1">
            {isNewBooking ? "توضیحات درخواست" : "دلیل درخواست"}
          </p>
          <p className="text-slate-700 dark:text-gray-300 text-xs line-clamp-2">
            {change.reason}
          </p>
        </div>
      )}

      {/* دلیل رد */}
      {change.admin_reason && change.status === "rejected" && (
        <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-2 mb-2">
          <p className="text-red-600 dark:text-red-400 text-[10px] mb-1">
            دلیل رد
          </p>
          <p className="text-red-700 dark:text-red-300 text-xs">
            {change.admin_reason}
          </p>
        </div>
      )}

      <p className="text-slate-500 dark:text-gray-500 text-[10px] mt-2">
        ثبت درخواست: {formatRequestDate(change.requested_at)}
      </p>

      {/* دکمه لغو مستقیم */}
      {canDirectCancel && onDirectCancel && (
        <button
          onClick={() =>
            onDirectCancel(
              change.booking_id,
              change.client_name,
              change.client_phone,
            )
          }
          className="mt-3 w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
        >
          <X className="w-3 h-3" />
          لغو نوبت
        </button>
      )}
    </motion.div>
  );
};

const InsufficientBalanceModal = ({
  isOpen,
  onClose,
  onBuySms,
  requiredAmount = 2,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBuySms: () => void;
  requiredAmount?: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">اعتبار پیامک کافی نیست!</h3>
          <p className="text-red-100 text-sm mt-1">لطفاً اعتبار خود را افزایش دهید</p>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-base">
              برای تایید یا رد این درخواست نیاز به <span className="font-bold text-red-600">{requiredAmount} واحد</span> اعتبار پیامک دارید.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              موجودی فعلی شما کافی نیست.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 transition active:scale-95"
            >
              بعداً
            </button>
            <button
              onClick={onBuySms}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              خرید اعتبار
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            💡 هر درخواست ۲ واحد اعتبار مصرف می‌کند
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ReviewModal = ({
  change,
  onClose,
  onApprove,
  onReject,
  isProcessing,
  smsBalance,
  isForceMode,
  onForceModeChange,
}: {
  change: BookingChange;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isProcessing: boolean;
  smsBalance: number;
  isForceMode: boolean;
  onForceModeChange: (value: boolean) => void;
}) => {
  const [reason, setReason] = useState("");
  const isReschedule = change.request_type === "reschedule";
  const isNewBooking = change.request_type === "new_booking";
  const fullServices = getFullServicesList(change);
  const needsSms = isReschedule || isNewBooking;
  const hasEnoughBalance = smsBalance >= 2;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-[#1a1d24] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-[#1a1d24] p-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              بررسی درخواست
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* نمایش موجودی */}
          <div className={`rounded-xl p-3 ${needsSms && !hasEnoughBalance && !isForceMode ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30' : 'bg-slate-100 dark:bg-black/30'}`}>
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-gray-500 text-xs">موجودی پیامک شما</p>
              <p className={`text-lg font-bold ${needsSms && !hasEnoughBalance && !isForceMode ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {smsBalance} واحد
              </p>
            </div>
            {needsSms && !hasEnoughBalance && !isForceMode && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                اعتبار شما برای تایید این درخواست کافی نیست!
              </p>
            )}
          </div>

          {/* گزینه تایید اجباری */}
          {(needsSms && !hasEnoughBalance) && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-200 dark:border-amber-500/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isForceMode}
                  onChange={(e) => onForceModeChange(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      تایید اجباری (بدون ارسال پیامک)
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                    با فعال کردن این گزینه، درخواست بدون ارسال پیامک به مشتری تایید می‌شود.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* اطلاعات مشتری */}
          <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-3">
            <p className="text-slate-500 dark:text-gray-500 text-xs mb-1">
              مشتری
            </p>
            <p className="text-slate-800 dark:text-white font-medium">
              {change.client_name}
            </p>
            <p className="text-slate-500 dark:text-gray-400 text-sm" dir="ltr">
              {change.client_phone}
            </p>
          </div>

          {/* نمایش سرویس‌ها */}
          {fullServices.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  سرویس‌های درخواستی
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {fullServices.map((service, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white dark:bg-black/30 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* زمان نوبت فعلی */}
          <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-3">
            <p className="text-slate-500 dark:text-gray-500 text-xs mb-1">
              {isNewBooking ? "تاریخ درخواستی نوبت" : "زمان فعلی نوبت"}
            </p>
            <p className="text-slate-800 dark:text-white">
              {formatPersianDateWithTime(change.old_date, change.old_time)}
            </p>
          </div>

          {/* زمان جدید برای درخواست تغییر */}
          {isReschedule && change.new_date && change.new_time && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-emerald-700 dark:text-emerald-400 text-xs mb-1">
                زمان جدید درخواستی
              </p>
              <p className="text-emerald-800 dark:text-emerald-300">
                {formatPersianDateWithTime(change.new_date, change.new_time)}
              </p>
            </div>
          )}

          {/* دلیل درخواست */}
          {change.reason && (
            <div className="bg-slate-100 dark:bg-gray-500/10 rounded-xl p-3">
              <p className="text-slate-500 dark:text-gray-500 text-xs mb-1">
                {isNewBooking ? "توضیحات درخواست" : "دلیل درخواست"}
              </p>
              <p className="text-slate-700 dark:text-gray-300">
                {change.reason}
              </p>
            </div>
          )}

          {/* هشدار هزینه */}
          {(isReschedule || isNewBooking) && (
            <div className={`rounded-xl p-3 border ${hasEnoughBalance || isForceMode ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className={`w-4 h-4 ${hasEnoughBalance || isForceMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                <p className={`text-xs font-bold ${hasEnoughBalance || isForceMode ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {isReschedule ? "هزینه پیامک" : "توجه"}
                </p>
              </div>
              <p className={`text-sm ${hasEnoughBalance || isForceMode ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                {isForceMode 
                  ? "در حالت تایید اجباری، هیچ پیامکی برای مشتری ارسال نمی‌شود و هزینه‌ای کسر نمی‌گردد."
                  : "با تایید یا رد این درخواست، یک پیامک اطلاع رسانی برای مشتری ارسال میشود و ۲ واحد از اعتبار پیامک شما کسر خواهد شد."
                }
              </p>
            </div>
          )}

          {/* دلیل رد */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">
              در صورت رد، دلیل را وارد کنید
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="دلیل رد درخواست..."
              rows={3}
              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>

        {/* دکمه‌های اقدام */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1a1d24] p-4 border-t border-slate-200 dark:border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition active:scale-95"
          >
            انصراف
          </button>
          <button
            onClick={() => onReject(reason)}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium transition disabled:opacity-50 active:scale-95"
          >
            رد
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing || (needsSms && !hasEnoughBalance && !isForceMode)}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-1 active:scale-95 ${
              needsSms && !hasEnoughBalance && !isForceMode
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
            }`}
            title={needsSms && !hasEnoughBalance && !isForceMode ? 'اعتبار پیامک کافی نیست. از گزینه تایید اجباری استفاده کنید.' : ''}
          >
            {isForceMode ? "تایید اجباری" : "تایید"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function BookingChangesPage() {
  const router = useRouter();
  const { balance: smsBalance, isLoading: balanceLoading } = useSmsBalance();
  const [changes, setChanges] = useState<BookingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChange, setSelectedChange] = useState<BookingChange | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isForceMode, setIsForceMode] = useState(false);
  const itemsPerPage = 8;

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/booking-changes");
      const data = await res.json();

      if (data.success) {
        setChanges(data.changes || []);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("خطا در دریافت درخواست‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const needsSmsForChange = (change: BookingChange): boolean => {
    return change.request_type === "reschedule" || change.request_type === "new_booking";
  };

  const handleBuySms = () => {
    setShowInsufficientModal(false);
    router.push("/clientdashboard/buysms");
  };

  const handleDirectCancel = async (
    bookingId: number,
    clientName: string,
    clientPhone: string,
  ) => {
    const reason = prompt("لطفاً دلیل لغو نوبت را وارد کنید:", "لغو توسط مدیر");
    if (reason === null) return;

    setIsProcessing(true);
    const loadingToast = toast.loading("در حال لغو نوبت...");
    try {
      const res = await fetch("/api/client/booking-changes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "direct_cancel",
          booking_id: bookingId,
          reason: reason.trim() || "لغو توسط مدیر",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadingToast });
        fetchChanges();
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("خطا در لغو نوبت", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedChange) return;
    
    const doApprove = async () => {
      setIsProcessing(true);
      const loadingToast = toast.loading(isForceMode ? "در حال تایید اجباری درخواست..." : "در حال تایید درخواست...");
      try {
        const res = await fetch("/api/client/booking-changes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: selectedChange.id, 
            action: "approve",
            force: isForceMode
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message, { id: loadingToast });
          fetchChanges();
          setIsModalOpen(false);
          setSelectedChange(null);
          setIsForceMode(false);
        } else {
          toast.error(data.message, { id: loadingToast });
        }
      } catch {
        toast.error("خطا در تایید درخواست", { id: loadingToast });
      } finally {
        setIsProcessing(false);
      }
    };

    if (!isForceMode && needsSmsForChange(selectedChange) && smsBalance < 2) {
      setShowInsufficientModal(true);
      return;
    }
    doApprove();
  };

  const handleReject = async (reason: string) => {
    if (!selectedChange) return;
    if (!reason.trim()) {
      toast.error("لطفاً دلیل رد را وارد کنید");
      return;
    }
    
    const doReject = async () => {
      setIsProcessing(true);
      const loadingToast = toast.loading(isForceMode ? "در حال رد اجباری درخواست..." : "در حال رد درخواست...");
      try {
        const res = await fetch("/api/client/booking-changes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedChange.id,
            action: "reject",
            reason,
            force: isForceMode
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message, { id: loadingToast });
          fetchChanges();
          setIsModalOpen(false);
          setSelectedChange(null);
          setIsForceMode(false);
        } else {
          toast.error(data.message, { id: loadingToast });
        }
      } catch {
        toast.error("خطا در رد درخواست", { id: loadingToast });
      } finally {
        setIsProcessing(false);
      }
    };

    if (!isForceMode && needsSmsForChange(selectedChange) && smsBalance < 2) {
      setShowInsufficientModal(true);
      return;
    }
    doReject();
  };

  const openModal = (change: BookingChange) => {
    setIsForceMode(false);
    setSelectedChange(change);
    setIsModalOpen(true);
  };

  const filteredChanges = changes.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterType !== "all" && c.request_type !== filterType) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredChanges.length / itemsPerPage);
  const paginatedChanges = filteredChanges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = {
    total: changes.length,
    pending: changes.filter((c) => c.status === "pending").length,
    cancelled: changes.filter(
      (c) => c.request_type === "cancel" && c.status === "pending",
    ).length,
    reschedule: changes.filter(
      (c) => c.request_type === "reschedule" && c.status === "pending",
    ).length,
    active: changes.filter((c) => c.request_type === "active_booking").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-800 dark:text-white transition-colors">
      <Toaster position="top-center" />

      <InsufficientBalanceModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        onBuySms={handleBuySms}
        requiredAmount={2}
      />

      <div className="pb-20 px-4 max-w-7xl mx-auto">
        {/* هشدار اعتبار پایین */}
        {!balanceLoading && smsBalance < 5 && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl border border-yellow-200 dark:border-yellow-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                {smsBalance == 0 ? "اعتبار پیامک شما به پایان رسیده برای ارسال پیامک تایید یا رد به مشتری اعتبار پیامکی رو شارژ کنید" : `اعتبار پیامک شما در حال اتمام است برای ارسال بدون مشکل پیامک تایید یا رد به مشتری بهتر است اعتبار پیامکی را شارژ کنید (${smsBalance} واحد باقیمانده)`}
              </span>
            </div>
            <button
              onClick={handleBuySms}
              className="px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium transition"
            >
              شارژ کنید
            </button>
          </div>
        )}

        {/* آمار */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            label="کل درخواست‌ها"
            value={stats.total}
            color="border-slate-200 dark:border-white/10"
            icon={CheckCircle}
          />
          <StatCard
            label="در انتظار تایید"
            value={stats.pending}
            color="border-yellow-200 dark:border-yellow-500/20"
          />
          <StatCard
            label="درخواست لغو"
            value={stats.cancelled}
            color="border-red-200 dark:border-red-500/20"
          />
          <StatCard
            label="درخواست تغییر"
            value={stats.reschedule}
            color="border-blue-200 dark:border-blue-500/20"
          />
          <StatCard
            label="نوبت‌های فعال"
            value={stats.active}
            color="border-emerald-200 dark:border-emerald-500/20"
          />
        </div>

        {/* فیلترها */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                  filterStatus === status
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                {status === "all" && "همه"}
                {status === "pending" && "در انتظار"}
                {status === "approved" && "تایید شده"}
                {status === "rejected" && "رد شده"}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "reschedule",
              "cancel",
              "new_booking",
              "active_booking",
            ].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 ${
                  filterType === type
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
              >
                {type === "all" && "همه نوع"}
                {type === "reschedule" && "تغییر زمان"}
                {type === "cancel" && "لغو نوبت"}
                {type === "new_booking" && "ثبت جدید"}
                {type === "active_booking" && "نوبت‌های فعال"}
              </button>
            ))}
          </div>

          <button
            onClick={fetchChanges}
            className="mr-auto px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* لیست درخواست‌ها */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : paginatedChanges.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1d24]/50 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-gray-600" />
            <p className="text-slate-500 dark:text-gray-500">
              هیچ درخواستی یافت نشد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {paginatedChanges.map((change) => (
              <ChangeCard
                key={change.id}
                change={change}
                onReview={() => openModal(change)}
                onDirectCancel={handleDirectCancel}
              />
            ))}
          </div>
        )}

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-white/5 disabled:opacity-40 active:scale-95 transition"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-white" />
            </button>
            <span className="text-sm text-slate-500 dark:text-gray-400">
              صفحه {currentPage} از {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-white/5 disabled:opacity-40 active:scale-95 transition"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-white" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedChange && (
          <ReviewModal
            change={selectedChange}
            onClose={() => setIsModalOpen(false)}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isProcessing}
            smsBalance={smsBalance}
            isForceMode={isForceMode}
            onForceModeChange={setIsForceMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}