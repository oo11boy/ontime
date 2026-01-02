"use client";
import React from "react";
import { RefreshCw, X, Scissors, PlusCircle, Edit3 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- Variants برای انیمیشن‌های استاندارد ---
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" dir="rtl">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-[#1a1e26] w-full max-w-sm rounded-[2.5rem] p-7 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* دکوراسیون پس‌زمینه (نور ملایم) */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] -z-10 rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
                  {editData ? <Edit3 size={22} /> : <PlusCircle size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {editData ? "ویرایش خدمت" : "خدمت جدید"}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Service Management
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Steps */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-2">
                   نام خدمت
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all font-medium shadow-inner"
                  placeholder="مثال: اصلاح موی سر"
                  value={form.name}
                  onChange={(e) => onFormChange("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">قیمت (تومان)</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => onFormChange("price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 mr-2">زمان (دقیقه)</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    placeholder="30"
                    value={form.duration_minutes}
                    onChange={(e) => onFormChange("duration_minutes", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-10">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                انصراف
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !form.name.trim()}
                className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative"
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
        </div>
      )}
    </AnimatePresence>
  );
};