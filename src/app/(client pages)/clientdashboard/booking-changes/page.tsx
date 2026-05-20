"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  User,
  Phone,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CreditCard,
  X,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { formatPersianDate } from "@/lib/date-utils";
import { useUserType } from "@/hooks/useUserType";
import Footer from "../components/Footer/Footer";

interface BookingChange {
  id: number;
  client_name: string;
  client_phone: string;
  old_date: string;
  old_time: string;
  new_date: string | null;
  new_time: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  request_type: "reschedule" | "cancel";
  reason: string | null;
  admin_reason: string | null;
  requested_at: string;
  booking_id: number;
  staff_id: number | null;
  staff_name: string | null;
  business_name: string;
  business_phone: string;
}

// تابع تبدیل زمان به فرمت HH:MM
const formatTime = (time: string): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return time;
};

// تابع تبدیل تاریخ میلادی به شمسی
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

// تابع تبدیل تاریخ و زمان
const formatPersianDateWithTime = (date: string, time: string): string => {
  return `${formatGregorianToPersian(date)} - ${formatTime(time)}`;
};

// تابع تبدیل تاریخ درخواست
const formatRequestDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// کامپوننت هدر ثابت
const FixedHeader = ({ isStaff, pendingCount }: { isStaff: boolean; pendingCount: number }) => {
  return (
    <div className="fixed top-0  max-w-md m-auto left-0 right-0 z-40 bg-[#0f1115]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <AlertTriangle className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-md md:text-md font-bold text-white">درخواست‌های تغییر نوبت</h1>
         
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="bg-yellow-500/20 px-3 py-1.5 rounded-full">
              <span className="text-yellow-400 text-[10px] font-bold">{pendingCount} در انتظار تایید</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// کارت آمار
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={`bg-[#1a1d24]  rounded-xl p-3 border ${color}`}>
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-xs font-bold text-white">{value}</p>
  </div>
);

// کارت درخواست
const ChangeCard = ({ change, onReview }: { change: BookingChange; onReview: () => void }) => {
  const isReschedule = change.request_type === "reschedule";
  const isPending = change.status === "pending";
  
  const getStatusStyle = () => {
    if (change.status === "pending") return "bg-yellow-500/20 text-yellow-400";
    if (change.status === "approved") return "bg-emerald-500/20 text-emerald-400";
    return "bg-red-500/20 text-red-400";
  };

  const getStatusLabel = () => {
    if (change.status === "pending") return "در انتظار تایید";
    if (change.status === "approved") return isReschedule ? "تغییر تایید شده" : "لغو تایید شده";
    return "رد شده";
  };

  return (
    <div className="bg-[#1a1d24] rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusStyle()}`}>
            {getStatusLabel()}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            isReschedule ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
          }`}>
            {isReschedule ? "تغییر زمان" : "لغو نوبت"}
          </span>
          {isReschedule && isPending && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> کسر ۲ پیامک
            </span>
          )}
        </div>
        {isPending && (
          <button
            onClick={onReview}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
          >
            بررسی
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm mb-3">
        <User className="w-4 h-4 text-gray-500" />
        <span className="text-white">{change.client_name}</span>
        <Phone className="w-4 h-4 text-gray-500 mr-2" />
        <span className="text-gray-400 text-xs" dir="ltr">{change.client_phone}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-black/30 rounded-lg p-2">
          <p className="text-gray-500 text-[10px] mb-1">زمان قبلی</p>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="text-white text-xs">
              {formatPersianDateWithTime(change.old_date, change.old_time)}
            </span>
          </div>
        </div>

        {isReschedule && change.new_date && change.new_time && (
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
            <p className="text-emerald-400 text-[10px] mb-1">زمان جدید درخواستی</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 text-xs">
                {formatPersianDateWithTime(change.new_date, change.new_time)}
              </span>
            </div>
          </div>
        )}
      </div>

      {change.reason && (
        <div className="bg-gray-500/10 rounded-lg p-2 mb-2">
          <p className="text-gray-500 text-[10px] mb-1">دلیل درخواست</p>
          <p className="text-gray-300 text-xs line-clamp-2">{change.reason}</p>
        </div>
      )}

      {change.admin_reason && change.status === "rejected" && (
        <div className="bg-red-500/10 rounded-lg p-2 mb-2">
          <p className="text-red-400 text-[10px] mb-1">دلیل رد</p>
          <p className="text-red-300 text-xs">{change.admin_reason}</p>
        </div>
      )}

      <p className="text-gray-500 text-[10px] mt-2">
        ثبت درخواست: {formatRequestDate(change.requested_at)}
      </p>
    </div>
  );
};

// مودال بررسی درخواست
const ReviewModal = ({
  change,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}: {
  change: BookingChange;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isProcessing: boolean;
}) => {
  const [reason, setReason] = useState("");
  const isReschedule = change.request_type === "reschedule";

  return (
    <div className="fixed inset-0  z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1d24] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#1a1d24] p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">بررسی درخواست</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">مشتری</p>
            <p className="text-white font-medium">{change.client_name}</p>
            <p className="text-gray-400 text-sm" dir="ltr">{change.client_phone}</p>
          </div>

          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">زمان قبلی نوبت</p>
            <p className="text-white">
              {formatPersianDateWithTime(change.old_date, change.old_time)}
            </p>
          </div>

          {isReschedule && change.new_date && change.new_time && (
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
              <p className="text-emerald-400 text-xs mb-1">زمان جدید درخواستی</p>
              <p className="text-emerald-300">
                {formatPersianDateWithTime(change.new_date, change.new_time)}
              </p>
            </div>
          )}

          {change.reason && (
            <div className="bg-gray-500/10 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">دلیل درخواست</p>
              <p className="text-gray-300">{change.reason}</p>
            </div>
          )}

          {isReschedule && (
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 text-xs font-bold">هزینه پیامک</p>
              </div>
              <p className="text-emerald-300 text-sm">
                با تایید این درخواست، <span className="font-bold">۲ واحد</span> از اعتبار پیامک شما کسر خواهد شد
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">در صورت رد، دلیل را وارد کنید</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="دلیل رد درخواست..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#1a1d24] p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition"
          >
            انصراف
          </button>
          <button
            onClick={() => onReject(reason)}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-50"
          >
            رد
          </button>
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <CreditCard className="w-4 h-4" />
            تایید
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function BookingChangesPage() {
  const { userType } = useUserType();
  const [changes, setChanges] = useState<BookingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChange, setSelectedChange] = useState<BookingChange | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const itemsPerPage = 8;

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/booking-changes");
      const data = await res.json();
      if (data.success) setChanges(data.changes);
      else toast.error(data.message);
    } catch {
      toast.error("خطا در دریافت درخواست‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  const handleApprove = async () => {
    if (!selectedChange) return;
    setIsProcessing(true);
    const loadingToast = toast.loading("در حال تایید درخواست...");
    try {
      const res = await fetch("/api/client/booking-changes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedChange.id, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadingToast });
        fetchChanges();
        setIsModalOpen(false);
        setSelectedChange(null);
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("خطا در تایید درخواست", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedChange) return;
    if (!reason.trim()) {
      toast.error("لطفاً دلیل رد را وارد کنید");
      return;
    }
    setIsProcessing(true);
    const loadingToast = toast.loading("در حال رد درخواست...");
    try {
      const res = await fetch("/api/client/booking-changes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedChange.id, action: "reject", reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: loadingToast });
        fetchChanges();
        setIsModalOpen(false);
        setSelectedChange(null);
        setRejectReason("");
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("خطا در رد درخواست", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (change: BookingChange) => {
    setSelectedChange(change);
    setIsModalOpen(true);
  };

  const filteredChanges = changes.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterType !== "all" && c.request_type !== filterType) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredChanges.length / itemsPerPage);
  const paginatedChanges = filteredChanges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: changes.length,
    pending: changes.filter((c) => c.status === "pending").length,
    cancelled: changes.filter((c) => c.request_type === "cancel" && c.status === "pending").length,
    reschedule: changes.filter((c) => c.request_type === "reschedule" && c.status === "pending").length,
  };

  const isStaff = userType === "staff";
  const pendingCount = stats.pending;

  return (
    <div className="min-h-screen max-w-md m-auto bg-[#0f1115] text-white">
      <Toaster position="top-center" />
      <FixedHeader isStaff={isStaff} pendingCount={pendingCount} />

      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2  md:grid-cols-4 gap-3 mb-6">
          <StatCard label="کل درخواست‌ها" value={stats.total} color="border-white/10" />
          <StatCard label="در انتظار تایید" value={stats.pending} color="border-yellow-500/20" />
          <StatCard label="درخواست لغو" value={stats.cancelled} color="border-red-500/20" />
          <StatCard label="درخواست تغییر زمان" value={stats.reschedule} color="border-blue-500/20" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === status
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {status === "all" && "همه"}
              {status === "pending" && "در انتظار"}
              {status === "approved" && "تایید شده"}
              {status === "rejected" && "رد شده"}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-1" />
          {["all", "reschedule", "cancel"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === type
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {type === "all" && "همه نوع"}
              {type === "reschedule" && "تغییر زمان"}
              {type === "cancel" && "لغو نوبت"}
            </button>
          ))}
          <button
            onClick={fetchChanges}
            className="mr-auto px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : paginatedChanges.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1d24]/50 rounded-2xl border border-dashed border-gray-700">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-500">هیچ درخواستی یافت نشد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedChanges.map((change) => (
              <ChangeCard key={change.id} change={change} onReview={() => openModal(change)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedChange && (
          <ReviewModal
            change={selectedChange}
            onClose={() => setIsModalOpen(false)}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}