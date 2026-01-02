"use client";

import React from "react";
import { UserX, CheckCircle } from "lucide-react";

interface UnblockCustomerModalProps {
  isOpen: boolean;
  clientName: string;
  cancelledCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnblockCustomerModal: React.FC<UnblockCustomerModalProps> = ({
  isOpen,
  clientName,
  cancelledCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1c222c] border border-red-500/30 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <div className="bg-red-500/10 p-4 rounded-full text-red-500">
            <UserX size={40} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-center mb-2">
          مشتری مسدود شده است!
        </h3>
        <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
          مشتری <span className="text-white font-bold">{clientName}</span> به دلیل
          <span className="text-red-400 font-bold"> {cancelledCount} بار لغو نوبت </span>
          در لیست سیاه قرار گرفته است.
        </p>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
          >
            <CheckCircle size={20} /> رفع مسدودیت و ثبت نوبت
          </button>

          <button
            onClick={onCancel}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-4 rounded-2xl font-medium transition-all"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnblockCustomerModal;