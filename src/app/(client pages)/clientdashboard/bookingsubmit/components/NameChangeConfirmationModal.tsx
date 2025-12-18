"use client";
import React from "react";
import { AlertCircle, X, ChevronLeft } from "lucide-react";

interface NameChangeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldName: string;
  newName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const NameChangeConfirmationModal: React.FC<NameChangeConfirmationModalProps> = ({
  isOpen,
  onClose,
  oldName,
  newName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-white">تغییر نام مشتری</h3>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">این شماره موبایل قبلاً در سیستم ثبت شده است:</p>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">نام فعلی در سیستم:</p>
                  <p className="text-lg font-bold text-amber-400">{oldName}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <ChevronLeft className="w-8 h-8 text-gray-500 rotate-90" />
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">نام جدید وارد شده:</p>
                  <p className="text-lg font-bold text-emerald-400">{newName}</p>
                </div>
              </div>
              
              <p className="text-gray-400 mt-6 text-sm">
                آیا می‌خواهید نام مشتری را از "{oldName}" به "{newName}" تغییر دهید؟
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition text-gray-300"
              >
                خیر، همان نام قبلی استفاده شود
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl font-bold text-white shadow-lg transition"
              >
                بله، تغییر نام
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              توجه: این تغییر در تمام نوبت‌های آینده این مشتری اعمال خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameChangeConfirmationModal;