// src/app/(client pages)/clientdashboard/components/DashboardWelcomeModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface DashboardWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardWelcomeModal: React.FC<DashboardWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 max-w-md m-auto flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-linear-to-br from-[#1a1e26] to-[#242933] rounded-3xl shadow-2xl border border-emerald-500/30 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-8 text-center">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl">
                  <CheckCircle className="w-12 h-12 text-black" />
                </div>
              </div>

              <h2 className="text-2xl text-white font-bold mb-4">خوش آمدید! 🎉</h2>
              
              <div className="space-y-4 text-lg leading-relaxed text-gray-200">
                <p>
                  ثبت‌نام شما با موفقیت انجام شد.
                </p>
                <p className="text-emerald-400 font-bold text-xl">
                  شما ۳ ماه استفاده رایگان از تمام امکانات اپلیکیشن نوبت‌دهی دریافت کردید!
                </p>
                <p>
                  همچنین هر ماه <span className="text-emerald-400 font-bold">۱۵۰ پیامک رایگان</span> به مدت سه ماه برایتان فعال شد.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-8 w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 font-bold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all active:scale-95"
              >
                شروع استفاده از پنل
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};