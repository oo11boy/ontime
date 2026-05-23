"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  ShoppingBag,
  Timer,
  Calendar,
  BadgeCheck,
  Hourglass,
  Ban,
  XCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CancelBookingModal } from "./CancelBookingModal";
import { RescheduleBookingModal } from "./RescheduleBookingModal";
import { CustomerBooking } from "../../../shared/types";
import { formatPersianDate } from "@/lib/date-utils";

const getCorrectPersianDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return formatPersianDate(dateStr);
    }
    const normalized = dateStr.split("T")[0];
    return formatPersianDate(normalized);
  } catch (error) {
    return dateStr;
  }
};

interface BookingCardProps {
  booking: CustomerBooking;
  slug: string;
  onRefresh: () => void;
}

export function BookingCard({ booking, slug, onRefresh }: BookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusConfig = () => {
    switch (booking.status) {
      case "active": return { icon: <BadgeCheck className="w-4 h-4" />, label: "تأیید شده", bgColor: "bg-emerald-500/20", textColor: "text-emerald-400", borderColor: "border-emerald-500/30" };
      case "pending": return { icon: <Hourglass className="w-4 h-4" />, label: "در انتظار تأیید", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400", borderColor: "border-yellow-500/30" };
      case "rejected": return { icon: <Ban className="w-4 h-4" />, label: "رد شده", bgColor: "bg-red-500/20", textColor: "text-red-400", borderColor: "border-red-500/30" };
      case "cancelled": return { icon: <XCircle className="w-4 h-4" />, label: "لغو شده", bgColor: "bg-gray-500/20", textColor: "text-gray-400", borderColor: "border-gray-500/30" };
      case "done": return { icon: <CheckCircle className="w-4 h-4" />, label: "انجام شده", bgColor: "bg-blue-500/20", textColor: "text-blue-400", borderColor: "border-blue-500/30" };
      default: return { icon: <AlertCircle className="w-4 h-4" />, label: "نامشخص", bgColor: "bg-gray-500/20", textColor: "text-gray-400", borderColor: "border-gray-500/30" };
    }
  };

  const statusConfig = getStatusConfig();
  const isPast = new Date(booking.booking_date) < new Date();
  const canShowActions = booking.status === "active" && !isPast;

  const handleCancel = async (reason: string) => {
    if (!booking.customer_token) { toast.error("توکن نوبت یافت نشد"); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/customer-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: booking.customer_token, action: "cancel", data: { reason } }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); setShowCancelModal(false); onRefresh(); } 
      else { toast.error(data.message); }
    } catch { toast.error("خطا در لغو نوبت"); } 
    finally { setIsProcessing(false); }
  };

  const handleReschedule = async (newDate: string, newTime: string, reason: string) => {
    if (!booking.customer_token) { toast.error("توکن نوبت یافت نشد"); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/customer-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: booking.customer_token, action: "reschedule", data: { newDate, newTime, reason } }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); setShowRescheduleModal(false); onRefresh(); } 
      else { toast.error(data.message); }
    } catch { toast.error("خطا در ثبت درخواست تغییر"); } 
    finally { setIsProcessing(false); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-white/5 to-transparent rounded-2xl p-4 border ${statusConfig.borderColor} transition-all`}
      >
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white text-xs font-medium">{getCorrectPersianDate(booking.booking_date)}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold">{booking.booking_time}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${statusConfig.bgColor}`}>
            {statusConfig.icon}
            <span className={`text-xs font-bold ${statusConfig.textColor}`}>{statusConfig.label}</span>
          </div>
        </div>

        {booking.services && (
          <div className="flex items-start gap-2 mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
            <p className="text-gray-400 text-xs line-clamp-2 flex-1">{booking.services}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-gray-600" />
            <p className="text-gray-500 text-[10px]">{booking.duration_minutes} دقیقه</p>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-600" />
            <p className="text-gray-500 text-[10px]">ثبت: {getCorrectPersianDate(booking.created_at?.split("T")[0] || new Date().toISOString().split("T")[0])}</p>
          </div>
        </div>

        {canShowActions && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
            {booking.can_reschedule !== false && booking.change_count === 0 && !booking.has_pending_reschedule && (
              <button onClick={() => setShowRescheduleModal(true)} className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" /> تغییر زمان
              </button>
            )}
            {booking.has_pending_reschedule && (
              <div className="flex-1 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium text-center">در انتظار تایید تغییر</div>
            )}
            {booking.can_cancel !== false && !booking.has_pending_cancel && (
              <button onClick={() => setShowCancelModal(true)} className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" /> لغو نوبت
              </button>
            )}
            {booking.has_pending_cancel && (
              <div className="flex-1 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium text-center">در انتظار تایید لغو</div>
            )}
          </div>
        )}
      </motion.div>

      <CancelBookingModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={handleCancel} isProcessing={isProcessing} />
      <RescheduleBookingModal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} booking={booking} slug={slug} onConfirm={handleReschedule} isProcessing={isProcessing} />
    </>
  );
}