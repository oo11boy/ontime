"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Calendar,
  User,
  Clock,
  Scissors,
  Phone,
  X,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPersianDate } from "@/lib/date-utils";
import { formatTimeDisplay, getStatusColor, getStatusText } from "../utils/formatUtils";

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  services: string;
  status: 'active' | 'cancelled' | 'done';
  booking_description?: string;
  sms_reserve_enabled: boolean;
  sms_reminder_enabled: boolean;
  sms_reminder_hours_before?: number;
}

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onCancel: (id: number) => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("آیا از کنسل کردن این نوبت اطمینان دارید؟")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/client/bookings/${appointment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("نوبت با موفقیت کنسل شد");
        onCancel(appointment.id);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در کنسل کردن نوبت");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {true && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
        >
          {/* Backdrop با انیمیشن blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content با اسپرینگ نرم از پایین (موبایل) یا مرکز (دسکتاپ) */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.8,
            }}
            className="relative w-full max-w-md bg-gradient-to-b from-[#1a1e26] to-[#242933] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">جزئیات نوبت</h3>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">تاریخ</p>
                  <p className="text-white font-bold">{formatPersianDate(appointment.booking_date)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">ساعت</p>
                  <p className="text-white font-bold">{formatTimeDisplay(appointment.booking_time)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">نام مشتری</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    {appointment.client_name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">شماره تماس</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    {appointment.client_phone}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">خدمات</span>
                  <span className="text-white font-medium flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-400" />
                    {appointment.services || "بدون خدمات"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-gray-400">وضعیت</span>
                  <span className={`font-bold ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                {appointment.booking_description && (
                  <div className="py-3 border-b border-white/10">
                    <p className="text-gray-400 mb-2">توضیحات</p>
                    <p className="text-white text-sm leading-relaxed">
                      {appointment.booking_description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">پیامک رزرو</p>
                    <span className={`text-sm font-medium ${appointment.sms_reserve_enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {appointment.sms_reserve_enabled ? 'ارسال شد' : 'ارسال نشد'}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">پیامک یادآوری</p>
                    <span className={`text-sm font-medium ${appointment.sms_reminder_enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {appointment.sms_reminder_enabled ? 'تنظیم شده' : 'خاموش'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              {appointment.status === 'active' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  کنسل کردن
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`py-3.5 ${appointment.status === 'active' ? 'flex-1' : 'w-full'} bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition`}
              >
                بستن
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailModal;