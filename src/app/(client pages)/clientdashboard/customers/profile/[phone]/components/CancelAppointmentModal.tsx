// components/CustomerProfile/CancelAppointmentModal.tsx
import React from "react";
import { AlertCircle, Send, Loader2, X } from "lucide-react";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  appointmentId: number | null;
  sendCancellationSms: boolean;
  cancellationMessage: string;
  canceling: boolean;
  onClose: () => void;
  onToggleSmsCheckbox: (checked: boolean) => void;
  onMessageChange: (value: string) => void;
  onCancelAppointment: () => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  appointmentId,
  sendCancellationSms,
  cancellationMessage,
  canceling,
  onClose,
  onToggleSmsCheckbox,
  onMessageChange,
  onCancelAppointment,
}) => {
  if (!isOpen || appointmentId === null) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-400 mb-5">
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-xl font-bold">کنسل کردن نوبت</h3>
        </div>
        <p className="text-gray-300 mb-6">
          آیا از کنسل کردن این نوبت مطمئن هستید؟
        </p>

        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={sendCancellationSms}
            onChange={(e) => onToggleSmsCheckbox(e.target.checked)}
            className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
          />
          <span className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            ارسال پیامک اطلاع‌رسانی کنسلی
          </span>
        </label>

        {sendCancellationSms && (
          <textarea
            value={cancellationMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="متن پیامک کنسلی..."
            className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-32 resize-none mb-4"
            dir="rtl"
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancelAppointment}
            disabled={
              (sendCancellationSms && !cancellationMessage.trim()) || canceling
            }
            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 ${
              (sendCancellationSms && !cancellationMessage.trim()) || canceling
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            }`}
          >
            {canceling ? <Loader2 className="w-5 h-5 animate-spin" /> : "کنسل کن"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};