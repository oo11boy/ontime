// components/Services/DeleteConfirmModal.tsx
import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1e26] border border-white/10 w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2">آیا مطمئن هستید؟</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              شما در حال حذف خدمت <span className="text-white font-semibold">"{title}"</span> هستید. این عمل غیرقابل بازگشت است.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "در حال حذف..." : "بله، حذف شود"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};