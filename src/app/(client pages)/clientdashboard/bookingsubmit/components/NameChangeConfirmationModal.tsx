"use client";
import React from "react";
import { AlertCircle, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // اضافه شده برای انیمیشن

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
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="name-change-wrapper" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop انیمیشنی */}
          <motion.div
            key="name-change-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* محتوای مودال */}
          <motion.div
            key="name-change-modal"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">تغییر نام مشتری</h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </motion.button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">این شماره موبایل قبلاً در سیستم ثبت شده است:</p>
                  
                  <div className="space-y-3">
                    {/* نام قدیمی */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/5"
                    >
                      <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">نام فعلی در سیستم</p>
                      <p className="text-lg font-bold text-amber-400">{oldName}</p>
                    </motion.div>
                    
                    <div className="flex items-center justify-center">
                      <div className="bg-white/10 p-1 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-gray-500 rotate-90" />
                      </div>
                    </div>
                    
                    {/* نام جدید */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20"
                    >
                      <p className="text-[10px] text-emerald-500/70 mb-1 uppercase tracking-wider">نام جدید وارد شده</p>
                      <p className="text-lg font-bold text-emerald-400">{newName}</p>
                    </motion.div>
                  </div>
                  
                  <p className="text-gray-400 mt-6 text-sm leading-relaxed px-4">
                    آیا می‌خواهید نام مشتری را از <span className="text-gray-200 font-bold">"{oldName}"</span> به <span className="text-gray-200 font-bold">"{newName}"</span> تغییر دهید؟
                  </p>
                </div>
                
                {/* دکمه‌های عملیاتی */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onCancel}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition text-gray-400 border border-white/5 order-2 sm:order-1"
                  >
                    خیر، همان قبلی
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onConfirm}
                    className="flex-1 py-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-2xl font-extrabold text-[#0f172a] shadow-lg shadow-amber-500/20 transition order-1 sm:order-2"
                  >
                    بله، تغییر نام
                  </motion.button>
                </div>
                
                <p className="text-[10px] text-gray-600 text-center leading-tight">
                  توجه: این تغییر در تمام نوبت‌های آینده این مشتری اعمال خواهد شد.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NameChangeConfirmationModal;