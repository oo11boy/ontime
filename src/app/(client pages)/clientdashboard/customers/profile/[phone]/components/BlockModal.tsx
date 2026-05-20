import React from "react";
import { Ban, CheckCircle, Loader2 } from "lucide-react";

interface BlockModalProps {
  isOpen: boolean;
  isUnblock: boolean;
  blocking: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  isUnblock,
  blocking,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const title = isUnblock ? "رفع مسدودیت مشتری" : "مسدود کردن مشتری";
  const iconColor = isUnblock ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400";
  const Icon = isUnblock ? CheckCircle : Ban;
  const confirmButtonClass = isUnblock
    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
  const message = isUnblock
    ? "آیا از رفع مسدودیت این مشتری اطمینان دارید؟ او مجدداً قادر به رزرو نوبت خواهد بود."
    : "با مسدود کردن این مشتری، تمام نوبت‌های آینده او کنسل شده و امکان دریافت نوبت جدید نخواهد داشت. آیا مطمئن هستید؟";

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-xl dark:shadow-2xl border ${
          isUnblock ? "border-green-300 dark:border-green-500/50" : "border-red-300 dark:border-red-500/50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center gap-3 ${iconColor} mb-5`}>
          <Icon className="w-8 h-8" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={blocking}
            className={`flex-1 py-3.5 ${confirmButtonClass} rounded-xl font-bold flex items-center justify-center gap-2 transition text-white`}
          >
            {blocking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isUnblock ? (
              "بله، رفع بلاک کن"
            ) : (
              "بله، بلاک کن"
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 dark:bg-white/10 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition text-slate-700 dark:text-white"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};