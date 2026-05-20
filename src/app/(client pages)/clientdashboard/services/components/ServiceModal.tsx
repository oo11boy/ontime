"use client";
import React from "react";
import { RefreshCw, X, Scissors, PlusCircle, Edit3, AlertTriangle, Lock } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useUserType } from "@/hooks/useUserType";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.9, y: 30 }
};

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  editData: Service | null;
  form: {
    name: string;
    price: string;
    duration_minutes: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  editData,
  form,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  const { userType } = useUserType();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" dir="rtl">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 dark:bg-black/85 backdrop-blur-md"
          />

          {userType == "user" ? (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white dark:bg-[#1a1e26] w-full max-w-sm rounded-[2.5rem] p-7 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] -z-10 rounded-full" />

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                    {editData ? <Edit3 size={22} /> : <PlusCircle size={22} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">
                      {editData ? "ویرایش خدمت" : "خدمت جدید"}
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      Service Management
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 mr-2 flex items-center gap-2">
                    نام خدمت
                  </label>
                  <input
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.08] transition-all font-medium shadow-inner"
                    placeholder="مثال: اصلاح موی سر"
                    value={form.name}
                    onChange={(e) => onFormChange("name", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-gray-400 mr-2">قیمت (تومان)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => onFormChange("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-gray-400 mr-2">زمان (دقیقه)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                      placeholder="30"
                      value={form.duration_minutes}
                      onChange={(e) => onFormChange("duration_minutes", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
                >
                  انصراف
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting || !form.name.trim()}
                  className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-gray-800 disabled:text-slate-500 dark:disabled:text-gray-600 text-white font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      تایید و ثبت
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white dark:bg-[#1a1e26] w-full max-w-sm rounded-[2.5rem] p-7 border border-amber-200 dark:border-amber-500/10 shadow-xl dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 blur-[80px] -z-10 rounded-full" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">
                      دسترسی محدود
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      Access Denied
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  ویرایش خدمات مجاز نیست
                </h3>
                
                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  شما به عنوان پرسنل، مجوز افزودن، ویرایش یا حذف خدمات را ندارید.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-slate-500 dark:text-gray-400 text-xs">
                    لطفاً برای افزودن یا ویرایش خدمات، با مدیریت مجموعه خود تماس بگیرید.  
                    مدیریت می‌تواند خدمات مجاز شما را در پنل مدیریتی خود تنظیم کند.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold transition-all active:scale-95"
                >
                  متوجه شدم
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};