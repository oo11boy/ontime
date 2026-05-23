"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, X, Loader2, AlertCircle } from "lucide-react";
import { DateTimeSelector } from "./DateTimeSelector";
import { CustomerBooking } from "../../../shared/types";

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: CustomerBooking;
  slug: string;
  onConfirm: (newDate: string, newTime: string, reason: string) => void;
  isProcessing: boolean;
}

export function RescheduleBookingModal({
  isOpen,
  onClose,
  booking,
  slug,
  onConfirm,
  isProcessing,
}: RescheduleBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-3xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-2xl p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">تغییر زمان نوبت</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">
              ⚠️ شما فقط یک بار مجاز به تغییر زمان نوبت هستید. درخواست شما پس از
              تایید مدیر اعمال خواهد شد.
            </p>
          </div>

          <DateTimeSelector
            slug={slug}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={(date) => {
              setSelectedDate(date);
              setDateError(null);
            }}
            onTimeChange={(time) => setSelectedTime(time)}
            onError={(error) => setDateError(error)}
          />

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              دلیل تغییر (اختیاری)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="لطفاً دلیل تغییر نوبت را وارد کنید..."
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-800/95 backdrop-blur-2xl p-5 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-medium hover:bg-white/10 transition"
          >
            انصراف
          </button>
          <button
            onClick={() => onConfirm(selectedDate, selectedTime, reason)}
            disabled={isProcessing || !selectedDate || !selectedTime}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            ثبت درخواست
          </button>
        </div>
      </motion.div>
    </div>
  );
}
