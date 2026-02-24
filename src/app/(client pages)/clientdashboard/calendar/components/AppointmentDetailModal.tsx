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
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPersianDate } from "@/lib/date-utils";
import {
  formatTimeDisplay,
  getStatusColor,
  getStatusText,
} from "../utils/formatUtils";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  services: string;
  status: "active" | "cancelled" | "done";
  booking_description?: string;
  sms_reserve_enabled: boolean;
  sms_reminder_enabled: boolean;
  sms_reminder_hours_before?: number;
}

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onCancel: () => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(
    null,
  );

  const { data: templatesData, isLoading: templatesLoading } =
    useSmsTemplates();

  // فقط الگوهایی که کلمه کنسل / لغو / ابطال داخل متن‌شان هست
  const cancellationTemplates = (templatesData?.templates || []).filter(
    (t: any) => {
      if (!t.content) return false;
      const text = t.content.toLowerCase();
      return (
        text.includes("کنسل") || text.includes("لغو") || text.includes("ابطال")
      );
    },
  );

  const handleCancel = async () => {
    setIsLoading(true);

    try {
      // ۱. کنسل کردن نوبت
      const response = await fetch(`/api/client/bookings/${appointment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در کنسل کردن نوبت");
      }

      // ۲. ارسال پیامک کنسلی در صورت انتخاب
      if (sendSms && selectedTemplateKey) {
        const smsResponse = await fetch("/api/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to_phone: appointment.client_phone,
            sms_type: "cancellation",
            booking_id: appointment.id,
            template_key: selectedTemplateKey,
            name: appointment.client_name,
            // date: formatPersianDate(appointment.booking_date),
            // time: appointment.booking_time,
          }),
        });

        if (!smsResponse.ok) {
          console.warn("ارسال پیامک کنسلی ناموفق بود");
        }
      }

      toast.success("نوبت با موفقیت کنسل شد");
      onCancel();
      onClose();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
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
          className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

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
                  <p className="text-white font-bold">
                    {formatPersianDate(appointment.booking_date)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">ساعت</p>
                  <p className="text-white font-bold">
                    {formatTimeDisplay(appointment.booking_time)}
                  </p>
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
                  <span
                    className={`font-bold ${getStatusColor(appointment.status)}`}
                  >
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
                    <span
                      className={`text-sm font-medium ${appointment.sms_reserve_enabled ? "text-emerald-400" : "text-gray-500"}`}
                    >
                      {appointment.sms_reserve_enabled
                        ? "ارسال شد"
                        : "ارسال نشد"}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">پیامک یادآوری</p>
                    <span
                      className={`text-sm font-medium ${appointment.sms_reminder_enabled ? "text-emerald-400" : "text-gray-500"}`}
                    >
                      {appointment.sms_reminder_enabled ? "تنظیم شده" : "خاموش"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              {appointment.status === "active" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirm(true)}
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
                className={`py-3.5 ${appointment.status === "active" ? "flex-1" : "w-full"} bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition`}
              >
                بستن
              </motion.button>
            </div>
          </motion.div>

          {/* مودال تأیید کنسل + انتخاب الگو */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-[#242933] rounded-2xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 text-red-400 mb-5">
                    <AlertCircle className="w-7 h-7" />
                    <h3 className="text-xl font-bold">کنسل کردن نوبت</h3>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    آیا از کنسل کردن نوبت {appointment.client_name} اطمینان
                    دارید؟
                  </p>

                  <label className="flex items-center gap-3 mb-6 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendSms}
                      onChange={(e) => {
                        setSendSms(e.target.checked);
                        if (!e.target.checked) setSelectedTemplateKey(null);
                      }}
                      className="w-5 h-5 rounded border-gray-600 text-red-500 focus:ring-red-500 bg-[#1e1e2e]"
                    />
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="w-4 h-4 text-red-400" />
                      <span>ارسال پیامک کنسلی به مشتری</span>
                    </div>
                  </label>

                  {sendSms && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-3">
                        الگوهای پیامک کنسلی:
                      </p>

                      {templatesLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        </div>
                      ) : cancellationTemplates.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-700 rounded-xl">
                          هیچ الگویی با کلمهٔ کنسل / لغو / ابطال یافت نشد
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                          {cancellationTemplates.map((tpl: any) => {
                            const isSelected =
                              selectedTemplateKey === tpl.payamresan_id;
                            return (
                              <button
                                key={tpl.id}
                                onClick={() =>
                                  setSelectedTemplateKey(tpl.payamresan_id)
                                }
                                className={`w-full text-right p-4 rounded-xl border transition-all text-sm leading-relaxed ${
                                  isSelected
                                    ? "border-red-500/60 bg-red-950/30 shadow-sm shadow-red-900/20"
                                    : "border-white/10 hover:bg-white/5 hover:border-white/20"
                                }`}
                              >
                                {tpl.content ? (
                                  <div
                                    className={`${isSelected ? "text-white" : "text-gray-300"}`}
                                  >
                                    {tpl.content}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 italic">
                                    متن الگو موجود نیست
                                  </div>
                                )}

                                {tpl.message_count && (
                                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">
                                  تعداد صفحه پیامک:  {tpl.message_count}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading || (sendSms && !selectedTemplateKey)}
                      className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        (sendSms && !selectedTemplateKey) || isLoading
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          در حال انجام...
                        </>
                      ) : (
                        "کنسل کردن نوبت"
                      )}
                    </button>

                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
                    >
                      انصراف
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailModal;
